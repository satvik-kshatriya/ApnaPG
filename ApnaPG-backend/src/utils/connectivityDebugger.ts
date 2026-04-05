import https from 'https';
import dns from 'dns/promises';
import net from 'net';
import tls from 'tls';

export const runConnectivityDiagnostics = async (mongoUri: string) => {
    const results: any = {
        timestamp: new Date().toISOString(),
        layers: {}
    };

    // Layer 1: Platform Outbound
    results.layers.platform = await new Promise((resolve) => {
        https.get('https://www.google.com', (res) => {
            resolve({ success: true, statusCode: res.statusCode });
        }).on('error', (err) => {
            resolve({ success: false, error: err.message });
        });
    });

    // Extract host from URI
    // Format: mongodb://user:pass@host1:27017,host2:27017/?...
    const hostMatch = mongoUri.match(/@([^/?]+)/);
    if (!hostMatch) {
        results.layers.dns = { success: false, error: 'Could not parse hosts from MONGO_URI' };
        return results;
    }

    const hosts = hostMatch[1].split(',');
    const primaryHostWithPort = hosts[0];
    const [host, portStr] = primaryHostWithPort.split(':');
    const port = parseInt(portStr) || 27017;

    results.target = { host, port };

    // Layer 2: DNS Resolution
    try {
        const dnsResult = await dns.lookup(host);
        results.layers.dns = { success: true, address: dnsResult.address, family: dnsResult.family };
    } catch (err: any) {
        results.layers.dns = { success: false, error: err.message };
    }

    // Layer 3: TCP Handshake
    results.layers.tcp = await new Promise((resolve) => {
        const start = Date.now();
        const socket = net.createConnection(port, host, () => {
            const latency = Date.now() - start;
            socket.destroy();
            resolve({ success: true, latency_ms: latency });
        });

        socket.on('error', (err) => {
            resolve({ success: false, error: err.message });
        });

        socket.setTimeout(5000);
        socket.on('timeout', () => {
            socket.destroy();
            resolve({ success: false, error: 'TCP Connection Timeout (5s)' });
        });
    });

    // Layer 4: TLS Handshake
    if (results.layers.tcp.success) {
        results.layers.tls = await new Promise((resolve) => {
            const start = Date.now();
            const tlsSocket = tls.connect({
                host,
                port,
                servername: host,
                rejectUnauthorized: false // We just want to see if handshake completes
            }, () => {
                const latency = Date.now() - start;
                const cert = tlsSocket.getPeerCertificate();
                tlsSocket.destroy();
                resolve({ 
                    success: true, 
                    latency_ms: latency, 
                    authorized: tlsSocket.authorized,
                    protocol: tlsSocket.getProtocol(),
                    subject: cert.subject
                });
            });

            tlsSocket.on('error', (err) => {
                resolve({ success: false, error: err.message });
            });

            tlsSocket.setTimeout(5000);
            tlsSocket.on('timeout', () => {
                tlsSocket.destroy();
                resolve({ success: false, error: 'TLS Handshake Timeout (5s)' });
            });
        });
    } else {
        results.layers.tls = { success: false, error: 'Skipped (TCP failed)' };
    }

    return results;
};

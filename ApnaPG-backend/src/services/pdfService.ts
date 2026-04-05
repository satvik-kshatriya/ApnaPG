import PDFDocument from 'pdfkit';

export const generateLeasePDF = async (tenant: any, owner: any, property: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // 1. Header & Title
      doc
        .fillColor('#1a1a2e')
        .fontSize(22)
        .text('Digital Rental Agreement', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .fillColor('#555555')
        .text(`Generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} via ApnaPG Platform`, { align: 'center' })
        .moveDown(1.5);

      doc
        .strokeColor('#16213e')
        .lineWidth(1.5)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(1.5);

      // Helper function for building sections
      const addSectionHeading = (text: string) => {
        doc
          .fillColor('#16213e')
          .fontSize(14)
          .text(text, { underline: true })
          .moveDown(0.5);
      };

      const addDetailField = (label: string, value: string) => {
        const currentY = doc.y;
        doc
          .fillColor('#16213e')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(label, 50, currentY);
        
        doc
          .fillColor('#333333')
          .font('Helvetica')
          .text(value || 'N/A', 180, currentY);
        
        doc.moveDown(0.5);
      };

      // 2. Property Details
      addSectionHeading('Property Details');
      addDetailField('Property Title:', property.title);
      addDetailField('Locality:', property.locality);
      addDetailField('Monthly Rent:', `INR ${property.monthly_rent.toLocaleString()}`);
      addDetailField('Occupancy Type:', property.occupancy_type.charAt(0).toUpperCase() + property.occupancy_type.slice(1));
      doc.moveDown(1);

      // 3. Owner Details
      addSectionHeading('Owner Details');
      addDetailField('Full Name:', owner.full_name);
      addDetailField('Email:', owner.email);
      addDetailField('Phone:', owner.phone_number || 'Not provided');
      doc.moveDown(1);

      // 4. Tenant Details
      addSectionHeading('Tenant Details');
      addDetailField('Full Name:', tenant.full_name);
      addDetailField('Email:', tenant.email);
      addDetailField('Phone:', tenant.phone_number || 'Not provided');
      doc.moveDown(1);

      // 5. House Rules
      addSectionHeading('House Rules');
      if (property.house_rules && Object.keys(property.house_rules).length > 0) {
        Object.entries(property.house_rules).forEach(([key, value]) => {
          const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          let displayValue = String(value);
          if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
          addDetailField(`${formattedKey}:`, displayValue);
        });
      } else {
        doc.fontSize(10).fillColor('#333333').text('No house rules specified.', 50, doc.y).moveDown(0.5);
      }
      doc.moveDown(1);

      // 6. Terms & Conditions
      addSectionHeading('Terms & Conditions');
      doc
        .fontSize(10)
        .fillColor('#333333')
        .font('Helvetica')
        .text('1. This agreement is generated digitally via the ApnaPG platform.')
        .moveDown(0.3)
        .text('2. Both parties agree to abide by the House Rules listed above.')
        .moveDown(0.3)
        .text(`3. The monthly rent of INR ${property.monthly_rent.toLocaleString()} is to be paid by the Tenant to the Owner on or before the 5th of each month.`)
        .moveDown(0.3)
        .text('4. Either party may terminate this agreement with a minimum of 30 days written notice.')
        .moveDown(1.5);

      // 7. Signatures
      addSectionHeading('Signatures');
      doc
        .fontSize(10)
        .text('Both parties acknowledge that they have read and agree to the terms of this digital agreement.', 50, doc.y)
        .moveDown(2);

      const sigY = doc.y;
      doc.text('__________________________', 50, sigY);
      doc.text('__________________________', 350, sigY);
      doc.moveDown(0.4);
      doc.font('Helvetica-Bold').text('Owner Signature', 50, doc.y);
      doc.font('Helvetica-Bold').text('Tenant Signature', 350, sigY + 12);
      
      doc.moveDown(1);
      doc.font('Helvetica').text('Date: _______________', 50, doc.y);
      doc.text('Date: _______________', 350, sigY + 36);

      // Finalize
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

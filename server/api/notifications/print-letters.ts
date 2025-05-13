import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { Stakeholder } from '~/server/models/Stakeholder';
import path from 'path';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { role, details, filter,schoolId } = body;

    if (!role) throw createError({ statusCode: 400, message: 'Role is required' });

    if (!details || !details.type || !details.name || !details.emis || !details.email || !details.phone) {
        throw createError({
            statusCode: 400,
            message: 'School details (type, name, emis, email, phone) are required',
        });
    }

    const dbQuery: any = {
        schoolId,
        role,
        $or: [{ fcmToken: { $exists: false } }, { fcmToken: "" }],
    };

    if ((role === 'Parent' || role === 'Learner') && filter) {
        if (Array.isArray(filter.grade) && !filter.grade.includes('All')) {
            dbQuery.grade = { $in: filter.grade };
        }

        if (Array.isArray(filter.class) && !filter.class.includes('All')) {
            dbQuery.class = { $in: filter.class };
        }
    }

    const stakeholders = await Stakeholder.find(dbQuery);

    if (!stakeholders.length)
        throw createError({ statusCode: 404, message: 'No unsubscribed stakeholders found' });

    const doc = new PDFDocument({ autoFirstPage: false, margin: 50 });
    const stream = Readable.from(doc);

    event.node.res.setHeader('Content-Type', 'application/pdf');
    event.node.res.setHeader('Content-Disposition', `attachment; filename=${role}-Letters.pdf`);

    pipeline(stream, event.node.res).catch(console.error);

    const logoPath = path.join(process.cwd(), 'public', 'logo.png');

    for (const stakeholder of stakeholders) {
        const { name, surname } = stakeholder;
        const stakeholderName = `${name} ${surname || ''}`.trim();
        const otpUrl = `${process.env.BASE_URL}/verify?sid=${stakeholder._id}`;
        const qrImage = await QRCode.toDataURL(otpUrl);

        doc.addPage();

        // Add school logo
        doc.image(logoPath, { fit: [100, 100], align: 'center' });
        doc.moveDown(0.5);

        // Add dynamic school details from details object
        doc.fontSize(16).text(`${details.name} (${details.type})`, { align: 'center' });
        doc.fontSize(10).text(`EMIS: ${details.emis}`, { align: 'center' });
        doc.text(`Email: ${details.email} | Phone: ${details.phone}`, { align: 'center' });
        doc.moveDown(0.5);

        // Draw horizontal line
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown();

        // Letter content
        doc.fontSize(14).text(`Dear ${stakeholderName}, (${role})`, { align: 'left' });

        // Dynamic grade/class or staff group info
        let roleInfoText = '';
        if (role === 'Parent') {
            const gradeText = stakeholder.grade || '';
            const classText = stakeholder.class || '';
            roleInfoText = `Grade: ${gradeText}${classText}`;
        } else if (role === 'Staff') {
            const groups = stakeholder.groups?.join(', ') || 'N/A';
            roleInfoText = `Staff : ${groups}`;
        }

        if (roleInfoText) {
            doc.fontSize(12).font('Helvetica-BoldOblique').text(roleInfoText, {
                align: 'right'
            });
        }

        doc.moveDown();
        doc.fontSize(12).text(
    `Dear ${role}, please scan the QR code below to receive school messages and newsletters on your phone.`,
    { align: 'justify' }
);
doc.moveDown();
doc.text(` Before scanning, please ensure the following settings are enabled on your phone:`);

doc.moveDown().text(` For **Android Users**:`);
doc.moveDown().list([
    `1. Go to Phone **Settings > Notifications > Chrome** and ensure **Allow Notifications** is turned ON.\n`,
    `2. Open **Chrome**, tap the **3 dots (⋮)** at the top-right, go to **Settings > Site Settings > Notifications**, and ensure **"Sites can ask to send notifications"** is enabled.`,
]);

doc.moveDown().text(` For **iOS Users**:`);
doc.moveDown().list([
    `1. Go to Phone **Settings > Notifications > Chrome** and ensure notifications are allowed.\n`,
    `2. Open **Chrome**, tap the **three dots (⋮)** at the bottom, go to **Settings > Content Settings > Notifications**, and ensure it's set to **Ask First**.`,
]);

doc.moveDown();
doc.text(`Once done, scan the QR code below to complete your subscription:`);

        doc.moveDown();
        doc.image(qrImage, { fit: [150, 150], align: 'center' });
       
        doc.text(`Thank you!`, { align: 'left' });
    }

    doc.end();
});

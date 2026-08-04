package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.Order;
import com.enterprise.ecommerce.model.OrderItem;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

@Service
public class InvoiceService {

    public ByteArrayInputStream generateInvoicePdf(Order order) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Font.BOLD);
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.BOLD);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL);

            // Title
            Paragraph title = new Paragraph("DUALFORGE ENTERPRISE INVOICE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Order Metadata Table
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(20);

            metaTable.addCell(new PdfPCell(new Phrase("Invoice details", sectionFont)));
            metaTable.addCell(new PdfPCell(new Phrase("Ship to details", sectionFont)));

            metaTable.addCell(new PdfPCell(new Phrase("Order ID: #DF-" + order.getId() + "\nDate: " + order.getOrderDate() + "\nStatus: " + order.getStatus(), normalFont)));
            metaTable.addCell(new PdfPCell(new Phrase("Customer: " + order.getUser().getFirstName() + " " + order.getUser().getLastName() + "\nAddress: " + order.getShippingAddress(), normalFont)));

            document.add(metaTable);

            // Itemized list table
            PdfPTable itemsTable = new PdfPTable(4);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new int[]{4, 1, 2, 2});
            itemsTable.setSpacingAfter(20);

            itemsTable.addCell(new PdfPCell(new Phrase("Product", sectionFont)));
            itemsTable.addCell(new PdfPCell(new Phrase("Qty", sectionFont)));
            itemsTable.addCell(new PdfPCell(new Phrase("Price", sectionFont)));
            itemsTable.addCell(new PdfPCell(new Phrase("Total", sectionFont)));

            for (OrderItem item : order.getItems()) {
                itemsTable.addCell(new PdfPCell(new Phrase(item.getProduct().getName(), normalFont)));
                itemsTable.addCell(new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), normalFont)));
                itemsTable.addCell(new PdfPCell(new Phrase("$" + String.format("%.2f", item.getPrice()), normalFont)));
                itemsTable.addCell(new PdfPCell(new Phrase("$" + String.format("%.2f", item.getPrice() * item.getQuantity()), normalFont)));
            }

            document.add(itemsTable);

            // Invoice Summary Totals
            Paragraph totals = new Paragraph("Total Amount Paid: $" + String.format("%.2f", order.getTotalAmount()) + "\nPayment Method: " + order.getPaymentMethod(), sectionFont);
            totals.setAlignment(Element.ALIGN_RIGHT);
            document.add(totals);

            document.close();

        } catch (DocumentException e) {
            throw new RuntimeException("Error rendering PDF", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}

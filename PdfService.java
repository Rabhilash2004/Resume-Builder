/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.resumebuilder.service;

/**
 *
 * @author abhil
 */
import com.example.resumebuilder.model.Resume;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Iterator;

@Service
public class PdfService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public byte[] generatePdf(Resume resume) throws Exception {
        JsonNode data = objectMapper.readTree(resume.getDataJson() == null ? "{}" : resume.getDataJson());

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(document, out);
        document.open();

        Font title = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
        Font section = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13);
        Font normal = FontFactory.getFont(FontFactory.HELVETICA, 11);

        String fullName = text(data, "fullName", "Your Name");
        String role = text(data, "title", "Professional Title");

        document.add(new Paragraph(fullName, title));
        document.add(new Paragraph(role, normal));
        document.add(new Paragraph(" "));
        document.add(new Paragraph("Email: " + text(data, "email", "-") + " | Phone: " + text(data, "phone", "-"), normal));
        document.add(new Paragraph("Location: " + text(data, "location", "-"), normal));
        document.add(new Paragraph("Website: " + text(data, "website", "-"), normal));
        document.add(new Paragraph("LinkedIn: " + text(data, "linkedin", "-"), normal));
        document.add(new Paragraph(" "));

        addSection(document, "Summary", text(data, "summary", "-"), section, normal);
        addListSection(document, "Skills", data.get("skills"), section, normal);
        addListSection(document, "Education", data.get("education"), section, normal);
        addListSection(document, "Experience", data.get("experience"), section, normal);
        addListSection(document, "Projects", data.get("projects"), section, normal);
        addListSection(document, "Certifications", data.get("certifications"), section, normal);

        document.close();
        return out.toByteArray();
    }

    private void addSection(Document document, String heading, String content, Font section, Font normal) throws DocumentException {
        document.add(new Paragraph(heading, section));
        document.add(new Paragraph(content, normal));
        document.add(new Paragraph(" "));
    }

    private void addListSection(Document document, String heading, JsonNode node, Font section, Font normal) throws DocumentException {
        document.add(new Paragraph(heading, section));

        if (node != null && node.isArray()) {
            for (Iterator<JsonNode> it = node.elements(); it.hasNext(); ) {
                JsonNode item = it.next();
                String line = item.isTextual() ? item.asText() : item.toString();
                document.add(new Paragraph("• " + line, normal));
            }
        } else if (node != null && node.isTextual()) {
            String[] parts = node.asText().split("\\n");
            for (String part : parts) {
                if (!part.trim().isEmpty()) {
                    document.add(new Paragraph("• " + part.trim(), normal));
                }
            }
        } else {
            document.add(new Paragraph("-", normal));
        }

        document.add(new Paragraph(" "));
    }

    private String text(JsonNode node, String field, String fallback) {
        JsonNode n = node.get(field);
        return (n == null || n.asText().isBlank()) ? fallback : n.asText();
    }
}

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.resumebuilder.controller;

/**
 *
 * @author abhil
 */
import com.example.resumebuilder.model.Resume;
import com.example.resumebuilder.repository.ResumeRepository;
import com.example.resumebuilder.service.PdfService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin
public class ResumeController {

    private final ResumeRepository resumeRepository;
    private final PdfService pdfService;

    public ResumeController(ResumeRepository resumeRepository, PdfService pdfService) {
        this.resumeRepository = resumeRepository;
        this.pdfService = pdfService;
    }

    public static class ResumeRequest {
        public Long id;
        public Long userId;
        public String title;
        public String templateName;
        public String dataJson;
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody ResumeRequest request) {
        if (request.userId == null || request.title == null || request.dataJson == null) {
            return ResponseEntity.badRequest().body("userId, title, dataJson are required");
        }

        Resume resume = request.id != null
                ? resumeRepository.findById(request.id).orElse(new Resume())
                : new Resume();

        resume.setUserId(request.userId);
        resume.setTitle(request.title);
        resume.setTemplateName(request.templateName == null ? "modern" : request.templateName);
        resume.setDataJson(request.dataJson);
        resume.setUpdatedAt(java.time.LocalDateTime.now());

        if (resume.getCreatedAt() == null) {
            resume.setCreatedAt(java.time.LocalDateTime.now());
        }

        Resume saved = resumeRepository.save(resume);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user/{userId}")
    public List<Resume> listByUser(@PathVariable Long userId) {
        return resumeRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        return resumeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!resumeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        resumeRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        Resume resume = resumeRepository.findById(id).orElse(null);
        if (resume == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            byte[] pdfBytes = pdfService.generatePdf(resume);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename((resume.getTitle() == null ? "resume" : resume.getTitle()) + ".pdf")
                    .build());

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("PDF generation failed: " + e.getMessage()).getBytes());
        }
    }
}
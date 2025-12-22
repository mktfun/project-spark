import fitz  # PyMuPDF

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from a PDF file (bytes).
    Raises ValueError if no text is found (e.g. scanned image).
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        
        doc.close()

        if not text.strip():
            raise ValueError("PDF sem camada de texto detectado. Por favor, envie um PDF pesquisável (não imagem/scanner).")
        
        return text
    except Exception as e:
        # Re-raise known errors or wrap unknown ones
        if "PDF sem camada" in str(e):
            raise e
        raise ValueError(f"Erro ao processar PDF: {str(e)}")

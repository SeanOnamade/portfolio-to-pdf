import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Helper to convert images to data URLs for better html2canvas support
const toDataURL = (url: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(url); // Fallback to original URL if it fails
        img.src = url;
    });
};

export const generatePDF = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Deep clone the element to modify it without affecting the UI
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);

    // Convert all images to Data URLs to bypass CORS/Taint issues
    const images = Array.from(clone.getElementsByTagName('img'));
    await Promise.all(images.map(async (img) => {
        if (img.src && !img.src.startsWith('data:')) {
            try {
                const dataUrl = await toDataURL(img.src);
                img.src = dataUrl;
            } catch (e) {
                console.warn('Failed to convert image to data URL', img.src);
            }
        }
    }));

    // Fix for missing icons: Convert SVGs to images because html2canvas has trouble with SVGs in some environments
    const svgs = Array.from(clone.getElementsByTagName('svg'));
    for (const svg of svgs) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        // Get SVG dimensions
        const rect = svg.getBoundingClientRect();
        canvas.width = rect.width || 24;
        canvas.height = rect.height || 24;

        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve) => {
            img.onload = () => {
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                const pngUrl = canvas.toDataURL('image/png');
                const imgElement = document.createElement('img');
                imgElement.src = pngUrl;
                imgElement.width = canvas.width;
                imgElement.height = canvas.height;

                // Copy classes
                imgElement.className = svg.getAttribute('class') || '';

                svg.parentNode?.replaceChild(imgElement, svg);
                URL.revokeObjectURL(url);
                resolve(null);
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(null);
            };
            img.src = url;
        });
    }

    // Wait for all images in the clone to be fully loaded (including the new ones)
    const finalImages = Array.from(clone.getElementsByTagName('img'));
    await Promise.all(finalImages.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    }));

    const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: true,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
    });

    // Cleanup clone
    document.body.removeChild(clone);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate image height in PDF units
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeightInPdf = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeightInPdf;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
    heightLeft -= pdfHeight;

    // Subsequent pages
    while (heightLeft > 0) {
        position = heightLeft - imgHeightInPdf;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
        heightLeft -= pdfHeight;
    }

    pdf.save(filename);
};

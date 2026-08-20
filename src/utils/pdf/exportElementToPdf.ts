import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Wait for all images inside a container to load fully.
 */
async function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  const promises = images.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  });
  await Promise.all(promises);
}

/**
 * Renders a DOM element to a multi-page A4 PDF and triggers a download.
 * Handles pagination dynamically, placing headers and footers on every page,
 * and splitting tables row-by-row to prevent content truncation.
 */
export async function exportElementToPdf(element: HTMLElement, filename: string): Promise<void> {
  const headerTpl = element.querySelector('[data-pdf-header]') as HTMLElement;
  const footerTpl = element.querySelector('[data-pdf-footer]') as HTMLElement;

  // Fallback to legacy behavior if pagination elements are not annotated
  if (!headerTpl || !footerTpl) {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/png');

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
    return;
  }

  // Measure header & footer height
  const headerHeight = headerTpl.getBoundingClientRect().height;
  const footerHeight = footerTpl.getBoundingClientRect().height;

  // A4 dimensions in pixels for a fixed-width container of 800px
  const PAGE_HEIGHT = 1130;
  const PAGE_PADDING = 32;
  const CONTENT_GAP = 20; // Margin below header / spacing
  const maxContentHeight = PAGE_HEIGHT - (PAGE_PADDING * 2) - headerHeight - footerHeight - CONTENT_GAP;

  // Create temporary container for paginated pages off-screen
  const paginatedContainer = document.createElement('div');
  paginatedContainer.style.position = 'fixed';
  paginatedContainer.style.top = '0';
  paginatedContainer.style.left = '-10000px';
  paginatedContainer.style.width = '800px';
  paginatedContainer.style.background = '#ffffff';
  document.body.appendChild(paginatedContainer);

  interface ContentItem {
    el: HTMLElement;
    height: number;
    isSplitTable: boolean;
    isHeading: boolean;
  }

  // Pre-measure all elements inside the original element before cloning
  const contentItems: ContentItem[] = [];
  for (const child of Array.from(element.children) as HTMLElement[]) {
    if (child === headerTpl || child === footerTpl) {
      continue;
    }
    contentItems.push({
      el: child,
      height: child.getBoundingClientRect().height,
      isSplitTable: child.hasAttribute('data-pdf-split-table') || (child.tagName.toLowerCase() === 'table' && child.hasAttribute('data-pdf-split-table')),
      isHeading: child.hasAttribute('data-pdf-heading'),
    });
  }

  const pages: { pageEl: HTMLElement; contentEl: HTMLElement }[] = [];

  const createPage = (): HTMLElement => {
    const pageEl = document.createElement('div');
    pageEl.className = 'pdf-page';
    pageEl.style.width = '800px';
    pageEl.style.height = `${PAGE_HEIGHT}px`;
    pageEl.style.padding = `${PAGE_PADDING}px`;
    pageEl.style.boxSizing = 'border-box';
    pageEl.style.position = 'relative';
    pageEl.style.background = '#ffffff';

    // Header clone
    const headerClone = headerTpl.cloneNode(true) as HTMLElement;
    pageEl.appendChild(headerClone);

    // Content container
    const contentEl = document.createElement('div');
    contentEl.className = 'pdf-page-content';
    contentEl.style.marginTop = `${CONTENT_GAP}px`;
    contentEl.style.height = `${maxContentHeight}px`;
    contentEl.style.boxSizing = 'border-box';
    contentEl.style.overflow = 'hidden';
    pageEl.appendChild(contentEl);

    // Footer clone (absolutely positioned at the bottom of the page)
    const footerClone = footerTpl.cloneNode(true) as HTMLElement;
    footerClone.style.position = 'absolute';
    footerClone.style.bottom = `${PAGE_PADDING}px`;
    footerClone.style.left = `${PAGE_PADDING}px`;
    footerClone.style.right = `${PAGE_PADDING}px`;
    pageEl.appendChild(footerClone);

    paginatedContainer.appendChild(pageEl);
    pages.push({ pageEl, contentEl });
    return contentEl;
  };

  let currentContentEl = createPage();
  let currentHeight = 0;

  for (let i = 0; i < contentItems.length; i++) {
    const item = contentItems[i];
    const itemHeight = item.height;

    // Prevent orphaned heading
    const nextItem = contentItems[i + 1];
    if (item.isHeading && nextItem) {
      let requiredHeight = itemHeight;
      if (nextItem.isSplitTable) {
        const tableHeader = nextItem.el.querySelector('thead') as HTMLElement;
        const firstRow = nextItem.el.querySelector('tbody tr') as HTMLElement;
        const headerH = tableHeader ? tableHeader.getBoundingClientRect().height : 35;
        const firstRowH = firstRow ? firstRow.getBoundingClientRect().height : 50;
        requiredHeight += headerH + firstRowH;
      } else {
        requiredHeight += nextItem.height;
      }

      if (currentHeight + requiredHeight > maxContentHeight) {
        currentContentEl = createPage();
        currentHeight = 0;
      }
    }

    if (item.isSplitTable) {
      const table = item.el as HTMLTableElement;
      const thead = table.querySelector('thead') as HTMLElement;
      const rows = Array.from(table.querySelectorAll('tbody tr')) as HTMLTableRowElement[];

      // Create initial table clone on current page
      const tableClone = table.cloneNode(false) as HTMLTableElement;
      const theadClone = thead.cloneNode(true) as HTMLElement;
      tableClone.appendChild(theadClone);
      const tbodyClone = document.createElement('tbody');
      tableClone.appendChild(tbodyClone);
      currentContentEl.appendChild(tableClone);

      const tableHeaderHeight = tableClone.getBoundingClientRect().height;
      currentHeight += tableHeaderHeight;

      let activeTbody = tbodyClone;

      for (const row of rows) {
        const rowHeight = row.getBoundingClientRect().height;

        if (currentHeight + rowHeight > maxContentHeight) {
          // Row does not fit, start a new page & new table clone
          currentContentEl = createPage();
          currentHeight = 0;

          const newTableClone = table.cloneNode(false) as HTMLTableElement;
          const newTheadClone = thead.cloneNode(true) as HTMLElement;
          newTableClone.appendChild(newTheadClone);
          const newTbodyClone = document.createElement('tbody');
          newTableClone.appendChild(newTbodyClone);
          currentContentEl.appendChild(newTableClone);

          const newHeaderH = newTableClone.getBoundingClientRect().height;
          currentHeight += newHeaderH;

          activeTbody = newTbodyClone;
        }

        const rowClone = row.cloneNode(true) as HTMLTableRowElement;
        activeTbody.appendChild(rowClone);
        currentHeight += rowHeight;
      }
    } else {
      // Normal content block
      if (currentHeight + itemHeight > maxContentHeight) {
        currentContentEl = createPage();
        currentHeight = 0;
      }
      const clone = item.el.cloneNode(true) as HTMLElement;
      currentContentEl.appendChild(clone);
      currentHeight += itemHeight;
    }
  }

  // Wait for all images inside cloned pages to load fully before capturing
  await waitForImages(paginatedContainer);

  // Generate multi-page PDF
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let idx = 0; idx < pages.length; idx++) {
    const { pageEl } = pages[idx];
    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');

    if (idx > 0) {
      pdf.addPage();
    }
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
  }

  pdf.save(filename);

  // Cleanup
  document.body.removeChild(paginatedContainer);
}


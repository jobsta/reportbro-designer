import AddDeleteDocElementCmd from './commands/AddDeleteDocElementCmd';
import Band from './container/Band';
import DocElement from './elements/DocElement';
import * as utils from './utils';

/**
 * Area to display all bands and its doc elements.
 * Further handles dragging of doc elements.
 * @class
 */
export default class Document {
    constructor(rootElement, showGrid, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.elPanel = null;
        this.elTabPdfLayout = null;
        this.elTabPdfPreview = null;
        this.elDoc = null;
        this.elDocContent = null;
        this.elHeader = null;
        this.elContent = null;
        this.elFooter = null;
        this.elSelectionArea = null;
        this.elDividerMarginLeft = null;
        this.elDividerMarginTop = null;
        this.elDividerMarginRight = null;
        this.elDividerMarginBottom = null;
        this.elDividerHeader = null;
        this.elDividerFooter = null;
        this.elPdfPreview = null;
        this.gridVisible = showGrid;
        this.gridSize = 10;
        this.zoom = 100;  // zoom level in percent
        this.zoomLevels = [25, 50, 75, 100, 150, 200, 400];
        this.pdfPreviewExists = false;
        this.pdfPreviewObjectURL = null;

        // moving/resizing of element
        this.dragging = false;
        this.dragElementType = null;
        this.dragType = DocElement.dragType.none;
        this.dragObjectId = null;
        this.dragContainerId = null;
        this.dragLinkedContainers = [];
        this.dragCurrentContainerId = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragCurrentX = 0;
        this.dragCurrentY = 0;
        this.dragSnapToGrid = false;
        this.dragEnterCount = 0;

        // drawing rectangle to select multiple elements
        this.selectionAreaStarted = false;
        this.selectionAreaStartX = 0;
        this.selectionAreaStartY = 0;
    }

    render() {
        this.elPanel = document.getElementById('rbro_document_panel');
        this.elPanel.addEventListener('mousedown', (event) => {
            if (this.rb.isDocElementSelected() && !event.shiftKey) {
                this.rb.deselectAll(true);
            }
            const offset = utils.getElementOffset(this.elDocContent);
            this.startSelectionArea(
                this.getCoordWithoutZoom(event.pageX - offset.left),
                this.getCoordWithoutZoom(event.pageY - offset.top));
        });

        const elDocTabs = utils.createElement('div', { id: 'rbro_document_tabs', class: 'rbroDocumentTabs' });
        elDocTabs.addEventListener('mousedown', (event) => {
            // avoid deselection of doc elements when clicking document tab
            event.stopPropagation();
        });

        this.elTabPdfLayout = utils.createElement(
            'div', { id: 'rbro_document_tab_pdf_layout', class: 'rbroDocumentTab rbroButton rbroTabButton' },
            this.rb.getLabel('documentTabPdfLayout'));
        this.elTabPdfLayout.addEventListener('click', (event) => {
            this.setDocumentTab(Document.tab.pdfLayout);
        });
        elDocTabs.append(this.elTabPdfLayout);
        this.elTabPdfPreview = utils.createElement(
            'div', {
                id: 'rbro_document_tab_pdf_preview',
                class: 'rbroDocumentTab rbroButton rbroTabButton rbroHidden rbroPdfPreview' +
                    (this.rb.getProperty('enableSpreadsheet') ? ' rbroXlsxDownload' : '')
            },
            this.rb.getLabel('documentTabPdfPreview'));
        this.elTabPdfPreview.addEventListener('click', (event) => {
            this.setDocumentTab(Document.tab.pdfPreview);
        });
        if (this.rb.getProperty('enableSpreadsheet')) {
            const elButtonXlsxDownload = utils.createElement(
                'span', {
                    class: 'rbroIcon-xlsx rbroXlsxDownloadButton',
                    title: this.rb.getLabel('documentTabXlsxDownload')
                });
            elButtonXlsxDownload.addEventListener('click', (event) => {
                this.rb.downloadSpreadsheet();
            });
            this.elTabPdfPreview.append(elButtonXlsxDownload);
        }
        const elClosePdfPreview = utils.createElement(
            'span', {
                class: 'rbroIcon-cancel',
                title: this.rb.getLabel('documentTabClose')
            });
        elClosePdfPreview.addEventListener('click', (event) => {
            this.closePdfPreviewTab();
        });
        this.elTabPdfPreview.append(elClosePdfPreview);
        elDocTabs.append(this.elTabPdfPreview);
        this.elPanel.append(elDocTabs);

        const docProperties = this.rb.getDocumentProperties();
        this.elDoc = utils.createElement(
            'div', { id: 'rbro_document_pdf', class: 'rbroDocument rbroDragTarget rbroHidden' });
        this.elDocContent = utils.createElement(
            'div', {
                id: 'rbro_document_content',
                class: 'rbroDocumentContent' + (this.gridVisible ? ' rbroDocumentGrid' : '')
            });
        this.elHeader = utils.createElement(
            'div', {
                id: 'rbro_header',
                class: 'rbroDocumentBand rbroElementContainer',
                style: 'top: 0px; left: 0px;'
            });
        this.elHeader.append(
            utils.createElement('div', { class: 'rbroDocumentBandDescription' }, this.rb.getLabel('bandHeader')));
        this.elDocContent.append(this.elHeader);
        this.elContent = utils.createElement(
            'div', {
                id: 'rbro_content',
                class: 'rbroDocumentBand rbroElementContainer'
            });
        this.elContent.append(
            utils.createElement('div', { class: 'rbroDocumentBandDescription' }, this.rb.getLabel('bandContent')));
        this.elDocContent.append(this.elContent);
        this.elFooter = utils.createElement(
            'div', {
                id: 'rbro_footer',
                class: 'rbroDocumentBand rbroElementContainer',
                style: 'bottom: 0px; left 0px;'
            });
        this.elFooter.append(
            utils.createElement('div', { class: 'rbroDocumentBandDescription' }, this.rb.getLabel('bandFooter')));
        this.elDocContent.append(this.elFooter);
        this.elDoc.append(this.elDocContent);

        this.elSelectionArea = utils.createElement(
            'div', { id: 'rbro_selection_area', class: 'rbroHidden rbroSelectionArea' });
        this.elDocContent.append(this.elSelectionArea);

        this.initializeEventHandlers();

        this.elDividerMarginLeft = utils.createElement(
            'div', { id: 'rbro_divider_margin_left', class: 'rbroDivider rbroDividerMarginLeft' });
        this.elDoc.append(this.elDividerMarginLeft);
        this.elDividerMarginTop = utils.createElement(
            'div', { id: 'rbro_divider_margin_top', class: 'rbroDivider rbroDividerMarginTop' });
        this.elDoc.append(this.elDividerMarginTop);
        this.elDividerMarginRight = utils.createElement(
            'div', { id: 'rbro_divider_margin_right', class: 'rbroDivider rbroDividerMarginRight' });
        this.elDoc.append(this.elDividerMarginRight);
        this.elDividerMarginBottom = utils.createElement(
            'div', { id: 'rbro_divider_margin_bottom', class: 'rbroDivider rbroDividerMarginBottom' });
        this.elDoc.append(this.elDividerMarginBottom);
        this.elDividerHeader = utils.createElement(
            'div', { id: 'rbro_divider_header', class: 'rbroDivider rbroDividerHeader' });
        this.elDoc.append(this.elDividerHeader);
        this.elDividerFooter = utils.createElement(
            'div', { id: 'rbro_divider_footer', class: 'rbroDivider rbroDividerFooter' });
        this.elDoc.append(this.elDividerFooter);
        this.elPanel.append(this.elDoc);

        this.elPdfPreview = utils.createElement(
            'div', { id: 'rbro_document_pdf_preview', class: 'rbroDocumentPreview' });
        this.elPanel.append(this.elPdfPreview);

        const size = docProperties.getPageSize();
        this.updatePageSize(size.width, size.height);
        this.updateHeader();
        this.updateFooter();
        this.updatePageMargins();
        this.updateDocumentTabs();

        this.setDocumentTab(Document.tab.pdfLayout);
    }

    initializeEventHandlers() {
        this.elDocContent.addEventListener('dragover', (event) => {
            this.processDragover(event);
        });
        this.elDocContent.addEventListener('dragenter', (event) => {
            if (this.rb.isBrowserDragActive('docElement')) {
                this.dragEnterCount++;
                event.preventDefault(); // needed for IE
            }
        });
        this.elDocContent.addEventListener('dragleave', (event) => {
            if (this.rb.isBrowserDragActive('docElement')) {
                this.dragEnterCount--;
                if (this.dragEnterCount === 0) {
                    const elContainers = document.querySelectorAll('.rbroElementContainer');
                    for (const elContainer of elContainers) {
                        elContainer.classList.remove('rbroElementDragOver');
                    }
                    this.dragContainerId = null;
                }
            }
        });
        this.elDocContent.addEventListener('drop', (event) => {
            this.processDrop(event);
            return false;
        });
    }

    processMouseMove(event) {
        if (this.dragging) {
            this.processDrag(event);
        } else if (this.selectionAreaStarted) {
            const offset = utils.getElementOffset(this.elDocContent);
            const area = this.getSelectionArea(
                this.getCoordWithoutZoom(event.pageX - offset.left),
                this.getCoordWithoutZoom(event.pageY - offset.top));
            this.elSelectionArea.style.left = this.rb.toPixel(area.left);
            this.elSelectionArea.style.top = this.rb.toPixel(area.top);
            this.elSelectionArea.style.width = this.rb.toPixel(area.width);
            this.elSelectionArea.style.height = this.rb.toPixel(area.height);
            if (this.elSelectionArea.classList.contains('rbroHidden')) {
                // show element after css properties are set
                this.elSelectionArea.classList.remove('rbroHidden');
            }
        }
    }

    /**
     * Process dragover event, i.e. new element is being dragged over a valid drop target.
     * @param {DragEvent} event
     */
    processDragover(event) {
        if (this.rb.isBrowserDragActive('docElement')) {
            const absPos = utils.getEventAbsPos(event);
            let container = null;
            if (absPos !== null) {
                container = this.getContainer(absPos.x, absPos.y, this.dragElementType, []);
                this.dragCurrentX = absPos.x;
                this.dragCurrentY = absPos.y;
            }
            const containerId = (container !== null) ? container.getId() : null;
            if (containerId !== this.dragContainerId) {
                const elContainers = document.querySelectorAll('.rbroElementContainer');
                for (const elContainer of elContainers) {
                    elContainer.classList.remove('rbroElementDragOver');
                }
                if (container !== null) {
                    container.dragOver();
                }
                this.dragContainerId = containerId;
            }
            // without preventDefault for dragover event, the drop event is not fired
            event.preventDefault();
            event.stopPropagation();
        }
    }

    /**
     * Process drop event, i.e. new element is dropped on a valid drop target.
     * @param {DragEvent} event
     */
    processDrop(event) {
        if (this.rb.isBrowserDragActive('docElement')) {
            event.preventDefault();
            const elContainers = document.querySelectorAll('.rbroElementContainer');
            for (const elContainer of elContainers) {
                elContainer.classList.remove('rbroElementDragOver');
            }

            if (this.dragElementType === DocElement.type.image && this.rb.getProperty('imageLimit') !== null) {
                let imageCount = 0;
                const docElements = this.rb.getDocElements(true);
                for (const docElement of docElements) {
                    if (docElement.getElementType() === DocElement.type.image) {
                        imageCount++;
                    }
                }
                if (imageCount >= this.rb.getProperty('imageLimit')) {
                    alert(this.rb.getLabel('docElementImageCountExceeded').replace(
                      '${count}', this.rb.getProperty('imageLimit')));
                    return;
                }
            }

            const absPos = utils.getEventAbsPos(event);
            if (absPos !== null) {
                this.dragCurrentX = absPos.x;
                this.dragCurrentY = absPos.y;
            }
            let container = this.getContainer(
                this.dragCurrentX, this.dragCurrentY, this.dragElementType, []);
            while (container !== null && !container.isElementAllowed(this.dragElementType)) {
                container = container.getParent();
            }
            if (container !== null && container.isElementAllowed(this.dragElementType)) {
                const offset = utils.getElementOffset(this.elDocContent);
                let x = this.getCoordWithoutZoom(this.dragCurrentX - offset.left);
                let y = this.getCoordWithoutZoom(this.dragCurrentY - offset.top);
                let containerOffset = container.getOffset();
                x -= containerOffset.x;
                y -= containerOffset.y;
                if (!event.ctrlKey && this.rb.getDocument().isGridVisible()) {
                    let gridSize = this.rb.getDocument().getGridSize();
                    x = utils.roundValueToInterval(x, gridSize);
                    y = utils.roundValueToInterval(y, gridSize);
                }
                const initialData = { x: '' + x, y: '' + y, containerId: container.getId() };
                const cmd = new AddDeleteDocElementCmd(
                    true, this.dragElementType, initialData, this.rb.getUniqueId(), container.getId(), -1, this.rb);
                this.rb.executeCommand(cmd);
            }
        }
    }

    /**
     * Process dragging existing element, i.e. element is selected and moved with pressed mouse button (or by touch).
     * @param {MouseEvent|TouchEvent} event
     */
    processDrag(event) {
        const absPos = utils.getEventAbsPos(event);
        if (this.dragType === DocElement.dragType.element) {
            const container = this.getContainer(absPos.x, absPos.y, this.dragElementType, this.dragLinkedContainers);
            const containerId = (container !== null) ? container.getId() : null;
            if (containerId !== this.dragCurrentContainerId) {
                const elContainers = document.querySelectorAll('.rbroElementContainer');
                for (const elContainer of elContainers) {
                    elContainer.classList.remove('rbroElementDragOver');
                }
                if (container !== null && containerId !== this.dragContainerId) {
                    container.dragOver();
                }
            }
            this.dragCurrentContainerId = containerId;
        }
        this.dragCurrentX = absPos.x;
        this.dragCurrentY = absPos.y;
        this.dragSnapToGrid = !event.ctrlKey;

        const dragObject = this.rb.getDataObject(this.dragObjectId);
        if (dragObject !== null) {
            const dragDiff = dragObject.getDragDiff(
                this.getCoordWithoutZoom(absPos.x - this.dragStartX),
                this.getCoordWithoutZoom(absPos.y - this.dragStartY), this.dragType,
                (this.dragSnapToGrid && this.isGridVisible()) ? this.getGridSize() : 0);
            this.rb.updateSelectionDrag(dragDiff.x, dragDiff.y, this.dragType, null, false);
        }
    }

    updatePageSize(width, height) {
        this.elDoc.style.width = this.rb.toPixel(width);
        this.elDoc.style.height = this.rb.toPixel(height);
    }

    updatePageMargins() {
        const docProperties = this.rb.getDocumentProperties();
        const marginLeft = utils.convertInputToNumber(docProperties.getValue('marginLeft'));
        const marginTop = utils.convertInputToNumber(docProperties.getValue('marginTop'));
        const marginRight = utils.convertInputToNumber(docProperties.getValue('marginRight'));
        const marginBottom = utils.convertInputToNumber(docProperties.getValue('marginBottom'));
        const left = this.rb.toPixel(marginLeft);
        const top = this.rb.toPixel(marginTop - 1);
        const right = this.rb.toPixel(marginRight);
        const bottom = this.rb.toPixel(marginBottom);
        this.elDividerMarginLeft.style.left = left;
        this.elDividerMarginTop.style.top = top;
        // hide divider in case margin is 0, otherwise divider is still visible
        if (marginLeft !== 0) {
            this.elDividerMarginLeft.style.left = left;
            this.elDividerMarginLeft.style.display = 'block';
        } else {
            this.elDividerMarginLeft.style.display = 'none';
        }
        if (marginTop !== 0) {
            this.elDividerMarginTop.style.top = top;
            this.elDividerMarginTop.style.display = 'block';
        } else {
            this.elDividerMarginTop.style.display = 'none';
        }
        if (marginRight !== 0) {
            this.elDividerMarginRight.style.right = right;
            this.elDividerMarginRight.style.display = 'block';
        } else {
            this.elDividerMarginRight.style.display = 'none';
        }
        if (marginBottom !== 0) {
            this.elDividerMarginBottom.style.bottom = bottom;
            this.elDividerMarginBottom.style.display = 'block';
        } else {
            this.elDividerMarginBottom.style.display = 'none';
        }
        this.elDocContent.style.left = left;
        this.elDocContent.style.top = top;
        this.elDocContent.style.right = right;
        this.elDocContent.style.bottom = bottom;
    }

    updateHeader() {
        const docProperties = this.rb.getDocumentProperties();
        if (docProperties.getValue('header')) {
            const headerSize = this.rb.toPixel(docProperties.getValue('headerSize'));
            this.elHeader.style.height = headerSize;
            this.elHeader.style.display = 'block';
            this.elDividerHeader.style.top = this.rb.toPixel(
                utils.convertInputToNumber(docProperties.getValue('marginTop')) +
                utils.convertInputToNumber(docProperties.getValue('headerSize')) - 1);
            this.elDividerHeader.style.display = 'block';
            this.elContent.style.top = headerSize;
        } else {
            this.elHeader.style.display = 'none';
            this.elDividerHeader.style.display = 'none';
            this.elContent.style.top = this.rb.toPixel(0);
        }
    }

    updateFooter() {
        const docProperties = this.rb.getDocumentProperties();
        if (docProperties.getValue('footer')) {
            const footerSize = this.rb.toPixel(docProperties.getValue('footerSize'));
            this.elFooter.style.height = footerSize;
            this.elFooter.style.display = 'block';
            this.elDividerFooter.style.bottom = this.rb.toPixel(
                utils.convertInputToNumber(docProperties.getValue('marginBottom')) +
                utils.convertInputToNumber(docProperties.getValue('footerSize')));
            this.elDividerFooter.style.display = 'block';
            this.elContent.style.bottom = footerSize;
        } else {
            this.elFooter.style.display = 'none';
            this.elDividerFooter.style.display = 'none';
            this.elContent.style.bottom = this.rb.toPixel(0);
        }
    }

    setDocumentTab(tab) {
        const elTabs = document.querySelectorAll('#rbro_document_tabs .rbroDocumentTab');
        const elMenuButtons = document.querySelectorAll('.rbroElementButtons .rbroMenuButton');
        const elActionButtons = document.querySelectorAll('.rbroActionButtons .rbroActionButton');
        for (const elTab of elTabs) {
            elTab.classList.remove('rbroActive');
        }
        // use z-index to show pdf preview instead of show/hide of div because otherwise pdf
        // is reloaded (and generated) again
        if (tab === Document.tab.pdfLayout) {
            this.elTabPdfLayout.classList.add('rbroActive');
            this.elDoc.classList.remove('rbroHidden');
            this.elPdfPreview.style.zIndex = '';
            this.elPdfPreview.style.height = '0';
            for (const elMenuButton of elMenuButtons) {
                elMenuButton.classList.remove('rbroDisabled');
                elMenuButton.draggable = true;
            }
            for (const elActionButton of elActionButtons) {
                elActionButton.disabled = false;
            }
        } else if (this.pdfPreviewExists && tab === Document.tab.pdfPreview) {
            this.elTabPdfPreview.classList.add('rbroActive');
            this.elDoc.classList.add('rbroHidden');
            this.elPdfPreview.style.zIndex = '1';
            this.elPdfPreview.style.height = '';
            for (const elMenuButton of elMenuButtons) {
                elMenuButton.classList.add('rbroDisabled');
                elMenuButton.draggable = false;
            }
            for (const elActionButton of elActionButtons) {
                elActionButton.disabled = true;
            }
        }
    }

    openPdfPreviewTab(reportUrl, headers) {
        utils.emptyElement(this.elPdfPreview);
        if (this.pdfPreviewObjectURL) {
            // release resource of previous object data url
            URL.revokeObjectURL(this.pdfPreviewObjectURL);
            this.pdfPreviewObjectURL = null;
        }

        if (headers && Object.keys(headers).length > 0) {
            // use ajax request so we can set custom headers
            // we do not use this solution per default because it is not possible to set a filename
            // for the preview pdf (which is displayed in Chrome and used for downloading the pdf), e.g.
            // https://stackoverflow.com/questions/53548182/can-i-set-the-filename-of-a-pdf-object-displayed-in-chrome
            const self = this;
            const xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        const obj = document.createElement('object');
                        obj.type = 'application/pdf';
                        obj.width = '100%';
                        obj.height = '100%';
                        self.pdfPreviewObjectURL = URL.createObjectURL(xhr.response);
                        obj.data = self.pdfPreviewObjectURL;
                        self.elPdfPreview.append(obj);
                    } else {
                        alert('preview failed');
                    }
                }
            };

            xhr.open('GET', reportUrl, true);
            for (const headerName in headers) {
                if (headers.hasOwnProperty(headerName)) {
                    xhr.setRequestHeader(headerName, headers[headerName]);
                }
            }
            xhr.send();
        } else {
            // easy way (no custom headers), set data url for pdf object tag
            const pdfObj = utils.createElement(
                'object', { data: reportUrl, type: 'application/pdf', width: '100%', height: '100%' })
            this.elPdfPreview.append(pdfObj);
        }

        this.pdfPreviewExists = true;
        this.setDocumentTab(Document.tab.pdfPreview);
        this.updateDocumentTabs();
    }

    closePdfPreviewTab() {
        this.pdfPreviewExists = false;
        utils.emptyElement(this.elPdfPreview);
        this.setDocumentTab(Document.tab.pdfLayout);
        this.updateDocumentTabs();
    }

    updateDocumentTabs() {
        let tabCount = 1;
        if (this.pdfPreviewExists) {
            this.elTabPdfPreview.classList.remove('rbroHidden');
            tabCount++;
        } else {
            this.elTabPdfPreview.classList.add('rbroHidden');
        }
        if (tabCount > 1) {
            document.getElementById('rbro_document_tabs').style.display = 'block';
            this.elPanel.classList.add('rbroHasTabs');
        } else {
            document.getElementById('rbro_document_tabs').style.display = 'none';
            this.elPanel.classList.remove('rbroHasTabs');
        }
    }

    /**
     * Returns container for given absolute position.
     * @param {Number} absPosX - absolute x position.
     * @param {Number} absPosY - absolute y position.
     * @param {String} elementType - needed for finding container, not all elements are allowed
     * in all containers (e.g. a frame cannot contain another frame).
     * @param {Container[]} ignoreContainers - these containers (and its children) cannot be returned,
     * this is useful when we move a container element (e.g. section or frame) and do not want to
     * get a container of this element.
     * @returns {?Container} Container or null in case no container was found for given position.
     */
    getContainer(absPosX, absPosY, elementType, ignoreContainers) {
        const offset = utils.getElementOffset(this.elDocContent);
        return this.rb.getContainer(
            this.getCoordWithoutZoom(absPosX - offset.left),
            this.getCoordWithoutZoom(absPosY - offset.top), elementType, ignoreContainers);
    }

    /**
     * Returns scroll y position of document content.
     * @returns {Number} scroll y position.
     */
    getContentScrollPosY() {
        const contentOffset = utils.getElementOffset(this.elDocContent);
        const panelOffset = utils.getElementOffset(this.elPanel);
        return panelOffset.top - contentOffset.top;
    }

    isGridVisible() {
        return this.gridVisible;
    }

    toggleGrid() {
        this.gridVisible = !this.gridVisible;
        if (this.gridVisible) {
            this.elDocContent.classList.add('rbroDocumentGrid');
        } else {
            this.elDocContent.classList.remove('rbroDocumentGrid');
        }
    }

    zoomIn() {
        for (let i=0; i < this.zoomLevels.length - 1; i++) {
            if (this.zoom === this.zoomLevels[i]) {
                this.updateZoomLevel(this.zoomLevels[i + 1]);
                break;
            }
        }
    }

    zoomOut() {
        for (let i=1; i < this.zoomLevels.length; i++) {
            if (this.zoom === this.zoomLevels[i]) {
                this.updateZoomLevel(this.zoomLevels[i - 1]);
                break;
            }
        }
    }

    isZoomInPossible() {
        return this.zoom < this.zoomLevels[this.zoomLevels.length - 1];
    }

    isZoomOutPossible() {
        return this.zoom > this.zoomLevels[0];
    }

    /**
     * Is called when the page size was changed.
     * Updates document style properties and is necessary in case the document is zoomed.
     */
    pageSizeChanged() {
        this.updateZoomLevel(this.zoom);
    }

    updateZoomLevel(zoom) {
        this.zoom = zoom;
        const size = this.rb.getDocumentProperties().getPageSize();
        const scaledWidth = size.width * (zoom / 100);
        const scaledHeight = size.height * (zoom / 100);
        const rbWidth = this.rb.getWidth();
        const docPanelWidth = rbWidth - this.rb.getMainPanel().getTotalPanelWidth();
        const computedStyle = getComputedStyle(this.elPanel);
        const paddingTop = parseInt(computedStyle.paddingTop) || 0;
        const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;
        const docPanelHeight = this.elPanel.clientHeight - paddingTop - paddingBottom;
        let translateX = 0;
        if (zoom !== 100) {
            if (size.width > docPanelWidth) {
                // if there is not enough space in the document panel initially and we zoom out we keep the content
                // in default (top left) position and move it to the center manually
                this.elDoc.style.transformOrigin = '';
                if ((zoom < 100) && (scaledWidth < docPanelWidth)) {
                    translateX = Math.round(((docPanelWidth - scaledWidth) / 2));
                }
            } else if (scaledWidth > docPanelWidth) {
                // if there is not enough space in the document panel with zoom level applied
                // we remove any margin and apply the default transformation (top left)
                this.elDoc.style.margin = '0';
                this.elDoc.style.transformOrigin = '';
            } else {
                // if there is enough space in the document panel we use the default margin (auto)
                // and apply the transformation from top center
                // so the content is automatically centered in the available horizontal space
                this.elDoc.style.margin = '';
                this.elDoc.style.transformOrigin = 'top center';
            }
            this.elDoc.style.transform = `translateX(${translateX}px) scale(${this.zoom / 100})`;
        } else {
            // use default values if no zoom is applied
            this.elDoc.style.margin = '';
            this.elDoc.style.transform = '';
            this.elDoc.style.transformOrigin = '';
        }
        document.getElementById('rbro_menu_zoom_level').textContent = zoom + ' %';
        this.rb.getMenuPanel().updateZoomButtons(this.isZoomInPossible(), this.isZoomOutPossible());

        // if there is enough space in the document panel don't show scrollbar
        if (scaledWidth < docPanelWidth) {
            this.elPanel.style.overflowX = 'hidden';
        }  else {
            this.elPanel.style.overflowX = '';
        }
        if (scaledHeight < docPanelHeight) {
            this.elPanel.style.overflowY = 'hidden';
        } else {
            this.elPanel.style.overflowY = '';
        }
    }

    getCoordWithoutZoom(coord) {
        return Math.round(coord * (100 / this.zoom));
    }

    getGridSize() {
        return this.gridSize;
    }

    getHeight() {
        return this.elDocContent.clientHeight;
    }

    getElement(band) {
        if (band === Band.bandType.header) {
            return this.elHeader;
        } else if (band === Band.bandType.content) {
            return this.elContent;
        } else if (band === Band.bandType.footer) {
            return this.elFooter;
        }
        return null;
    }

    /**
     * Return element for page background independent of page margins.
     * @return {Element}
     */
    getPageElement() {
        return this.elDoc;
    }

    isDragging() {
        return this.dragging;
    }

    isDragged() {
        return this.dragging && ((this.dragStartX !== this.dragCurrentX) || (this.dragStartY !== this.dragCurrentY));
    }

    startDrag(x, y, objectId, containerId, elementType, dragType) {
        this.dragging = true;
        this.dragStartX = this.dragCurrentX = x;
        this.dragStartY = this.dragCurrentY = y;
        this.dragElementType = elementType;
        this.dragType = dragType;
        this.dragObjectId = objectId;
        this.dragContainerId = containerId;
        this.dragLinkedContainers = [];
        this.dragCurrentContainerId = null;
        this.dragSnapToGrid = false;

        const dragObject = this.rb.getDataObject(this.dragObjectId);
        if (dragObject) {
            this.dragLinkedContainers = dragObject.getLinkedContainers();
        }
    }

    /**
     * Stop dragging existing element, i.e. element was selected and moved, pressed mouse button (or touch)
     * was released.
     */
    stopDrag() {
        const diffX = this.getCoordWithoutZoom(this.dragCurrentX - this.dragStartX);
        const diffY = this.getCoordWithoutZoom(this.dragCurrentY - this.dragStartY);
        const dragObject = this.rb.getDataObject(this.dragObjectId);
        if (dragObject !== null && (diffX !== 0 || diffY !== 0)) {
            let container = null;
            if (this.dragType === DocElement.dragType.element) {
                container = this.rb.getDataObject(this.dragCurrentContainerId);
            }

            // do not allow to change container of elements when multiple elements from different containers
            // are dragged together as this could lead to unexpected results for the user
            let selectedObjects = this.rb.getSelectedObjects();
            if (selectedObjects.length > 1 && container !== null) {
                const firstSelectedObjContainerId = selectedObjects[0].getContainerId();
                for (let i=1; i < selectedObjects.length; i++) {
                    if (selectedObjects[i].getContainerId() !== firstSelectedObjContainerId) {
                        container = null;
                        break;
                    }
                }
            }

            let dragDiff = dragObject.getDragDiff(
                diffX, diffY, this.dragType, (this.dragSnapToGrid && this.isGridVisible()) ? this.getGridSize() : 0);
            this.rb.updateSelectionDrag(dragDiff.x, dragDiff.y, this.dragType, container, true);
        } else {
            this.rb.updateSelectionDrag(0, 0, this.dragType, null, false);
        }
        this.dragging = false;
        this.dragType = DocElement.dragType.none;
        this.dragObjectId = null;
        this.dragContainerId = null;
        this.dragCurrentContainerId = null;
        const elContainers = document.querySelectorAll('.rbroElementContainer');
        for (const elContainer of elContainers) {
            elContainer.classList.remove('rbroElementDragOver');
        }
    }

    startBrowserDrag(dragElementType) {
        this.dragEnterCount = 0;
        this.dragObjectId = null;
        this.dragContainerId = null;
        this.dragLinkedContainers = [];
        this.dragElementType = dragElementType;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragCurrentX = 0;
        this.dragCurrentY = 0;
    }

    startSelectionArea(x, y) {
        this.selectionAreaStarted = true;
        this.selectionAreaStartX = x;
        this.selectionAreaStartY = y;
    }

    stopSelectionArea(x, y, clearSelection) {
        const area = this.getSelectionArea(x, y);
        if (area.width > 10 && area.height > 10) {
            let docElements = this.rb.getDocElements(true);
            for (let docElement of docElements) {
                // do not select table text, band elements and containers
                if (docElement.isAreaSelectionAllowed()) {
                    let pos = docElement.getAbsolutePosition();
                    if (area.left < (pos.x + docElement.getValue('widthVal')) &&
                        (area.left + area.width) >= pos.x &&
                        area.top < (pos.y + docElement.getValue('heightVal')) &&
                        (area.top + area.height) >= pos.y) {
                        let allowSelect = true;
                        // do not allow selection of element if its container is already selected,
                        // e.g. text inside selected frame element
                        if (docElement.getContainerId()) {
                            const container = docElement.getContainer();
                            if (container !== null && container.isSelected()) {
                                allowSelect = false;
                            }
                        }
                        if (allowSelect) {
                            this.rb.selectObject(docElement.getId(), clearSelection);
                            clearSelection = false;
                        }
                    }
                }
            }
        }

        this.selectionAreaStarted = false;
        this.selectionAreaStartX = 0;
        this.selectionAreaStartY = 0;
        this.elSelectionArea.classList.add('rbroHidden');
    }

    getSelectionArea(x, y) {
        const area = {};
        if (x > this.selectionAreaStartX) {
            area.left = this.selectionAreaStartX;
            area.width = x - this.selectionAreaStartX;
        } else {
            area.left = x;
            area.width = this.selectionAreaStartX - x;
        }
        if (y > this.selectionAreaStartY) {
            area.top = this.selectionAreaStartY;
            area.height = y - this.selectionAreaStartY;
        } else {
            area.top = y;
            area.height = this.selectionAreaStartY - y;
        }
        return area;
    }

    mouseUp(event) {
        if (this.isDragging()) {
            this.stopDrag();
        }
        if (this.selectionAreaStarted) {
            const offset = utils.getElementOffset(this.elDocContent);
            this.stopSelectionArea(
                this.getCoordWithoutZoom(event.pageX - offset.left),
                this.getCoordWithoutZoom(event.pageY - offset.top),
                !event.shiftKey);
        }
    }

    windowResized() {
        // the document content position must be updated in case the available space changed
        this.updateZoomLevel(this.zoom);
    }
}

Document.tab = {
    pdfLayout: 'pdfLayout',
    pdfPreview: 'pdfPreview'
};

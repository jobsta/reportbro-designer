import AddDeleteDocElementCmd from './commands/AddDeleteDocElementCmd';
import Band from './container/Band';
import DocumentProperties from './data/DocumentProperties';
import DocElement from './elements/DocElement';
import * as utils from './utils';
import {getEventAbsPos} from "./utils";

/**
 * Area to display all bands and its doc elements.
 * Further handles dragging of doc elements.
 * @class
 */
export default class Document {
    constructor(rootElement, showGrid, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.elDoc = null;
        this.elDocContent = null;
        this.elHeader = null;
        this.elContent = null;
        this.elFooter = null;
        this.elSelectionArea = null;
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
        this.dragLinkedContainerId = null;
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
        let panel = $('#rbro_document_panel')
            .mousedown(event => {
                if (this.rb.isDocElementSelected() && !event.shiftKey) {
                    this.rb.deselectAll(true);
                }
                let offset = this.elDocContent.offset();
                this.startSelectionArea(
                    this.getCoordWithoutZoom(event.originalEvent.pageX - offset.left),
                    this.getCoordWithoutZoom(event.originalEvent.pageY - offset.top));
            });

        let elDocTabs = $('<div id="rbro_document_tabs" class="rbroDocumentTabs"></div>')
            .mousedown(event => {
                // avoid deselection of doc elements when clicking document tab
                event.stopPropagation();
            });

        elDocTabs.append(
            $(`<div id="rbro_document_tab_pdf_layout" class="rbroDocumentTab rbroButton rbroTabButton">
               ${this.rb.getLabel('documentTabPdfLayout')}</div>`)
            .click(event => {
                this.setDocumentTab(Document.tab.pdfLayout);
            }));
        let btnPdfPreview = $(
            `<div id="rbro_document_tab_pdf_preview" class="rbroDocumentTab rbroButton rbroTabButton rbroHidden rbroPdfPreview 
                ${this.rb.getProperty('enableSpreadsheet') ? 'rbroXlsxDownload' : ''}">
                ${this.rb.getLabel('documentTabPdfPreview')}</div>`)
            .click(event => {
                this.setDocumentTab(Document.tab.pdfPreview);
            });
        if (this.rb.getProperty('enableSpreadsheet')) {
            btnPdfPreview.append($(
                `<span class="rbroIcon-xlsx rbroXlsxDownlaodButton" title="${this.rb.getLabel('documentTabXlsxDownload')}"></span>`)
                .click(event => { this.rb.downloadSpreadsheet(); }));
        }
        btnPdfPreview.append($(
            `<span class="rbroIcon-cancel" title="${this.rb.getLabel('documentTabClose')}"></span>`)
            .click(event => { this.closePdfPreviewTab(); }));
        elDocTabs.append(btnPdfPreview);
        panel.append(elDocTabs);

        let docProperties = this.rb.getDocumentProperties();
        this.elDoc = $('<div id="rbro_document_pdf" class="rbroDocument rbroDragTarget rbroHidden"></div>');
        this.elDocContent = $(`<div id="rbro_document_content"
            class="rbroDocumentContent ${this.gridVisible ? 'rbroDocumentGrid' : ''}"></div>`);
        this.elHeader = $(`<div id="rbro_header" class="rbroDocumentBand rbroElementContainer"
            style="top: 0px; left: 0px;"></div>`);
        this.elHeader.append($(`<div class="rbroDocumentBandDescription">${this.rb.getLabel('bandHeader')}</div>`));
        this.elDocContent.append(this.elHeader);
        this.elContent = $('<div id="rbro_content" class="rbroDocumentBand rbroElementContainer"></div>');
        this.elContent.append($(`<div class="rbroDocumentBandDescription">${this.rb.getLabel('bandContent')}</div>`));
        this.elDocContent.append(this.elContent);
        this.elFooter = $(`<div id="rbro_footer" class="rbroDocumentBand rbroElementContainer"
            style="bottom: 0px; left 0px;"></div>`);
        this.elFooter.append($(`<div class="rbroDocumentBandDescription">${this.rb.getLabel('bandFooter')}</div>`));
        this.elDocContent.append(this.elFooter);
        this.elDoc.append(this.elDocContent);

        this.elSelectionArea = $('<div id="rbro_selection_area" class="rbroHidden rbroSelectionArea"></div>');
        this.elDocContent.append(this.elSelectionArea);

        this.initializeEventHandlers();

        this.elDoc.append('<div id="rbro_divider_margin_left" class="rbroDivider rbroDividerMarginLeft"></div>');
        this.elDoc.append('<div id="rbro_divider_margin_top" class="rbroDivider rbroDividerMarginTop"></div>');
        this.elDoc.append('<div id="rbro_divider_margin_right" class="rbroDivider rbroDividerMarginRight"></div>');
        this.elDoc.append('<div id="rbro_divider_margin_bottom" class="rbroDivider rbroDividerMarginBottom"></div>');
        this.elDoc.append('<div id="rbro_divider_header" class="rbroDivider rbroDividerHeader"></div>');
        this.elDoc.append('<div id="rbro_divider_footer" class="rbroDivider rbroDividerFooter"></div>');
        panel.append(this.elDoc);

        panel.append($('<div id="rbro_document_pdf_preview" class="rbroDocumentPreview"></div>'));

        let size = docProperties.getPageSize();
        this.updatePageSize(size.width, size.height);
        this.updateHeader();
        this.updateFooter();
        this.updatePageMargins();
        this.updateDocumentTabs();

        this.setDocumentTab(Document.tab.pdfLayout);
    }

    initializeEventHandlers() {
        this.elDocContent.on('dragover', event => {
            this.processDragover(event);
        })
        .on('dragenter', event => {
            if (this.rb.isBrowserDragActive('docElement')) {
                this.dragEnterCount++;
                event.preventDefault(); // needed for IE
            }
        })
        .on('dragleave', event => {
            if (this.rb.isBrowserDragActive('docElement')) {
                this.dragEnterCount--;
                if (this.dragEnterCount === 0) {
                    $('.rbroElementContainer').removeClass('rbroElementDragOver');
                    this.dragContainerId = null;
                }
            }
        })
        .on('drop', event => {
            this.processDrop(event);
            return false;
        });
    }

    processMouseMove(event) {
        if (this.dragging) {
            this.processDrag(event);
        } else if (this.selectionAreaStarted) {
            let offset = this.elDocContent.offset();
            let area = this.getSelectionArea(
                this.getCoordWithoutZoom(event.originalEvent.pageX - offset.left),
                this.getCoordWithoutZoom(event.originalEvent.pageY - offset.top));
            let props = {
                left: this.rb.toPixel(area.left), top: this.rb.toPixel(area.top),
                width: this.rb.toPixel(area.width), height: this.rb.toPixel(area.height)};
            this.elSelectionArea.css(props);
            if (this.elSelectionArea.hasClass('rbroHidden')) {
                // show element after css properties are set
                this.elSelectionArea.removeClass('rbroHidden');
            }
        }
    }

    processDragover(event) {
        if (this.rb.isBrowserDragActive('docElement')) {
            let absPos = getEventAbsPos(event);
            let container = null;
            if (absPos !== null) {
                container = this.getContainer(absPos.x, absPos.y, this.dragElementType);
                this.dragCurrentX = absPos.x;
                this.dragCurrentY = absPos.y;
            }
            let containerId = (container !== null) ? container.getId() : null;
            if (containerId !== this.dragContainerId) {
                $('.rbroElementContainer').removeClass('rbroElementDragOver');
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

    processDrop(event) {
        if (this.rb.isBrowserDragActive('docElement')) {
            let absPos = getEventAbsPos(event);
            if (absPos !== null) {
                this.dragCurrentX = absPos.x;
                this.dragCurrentY = absPos.y;
            }
            $('.rbroElementContainer').removeClass('rbroElementDragOver');
            let container = this.getContainer(
                this.dragCurrentX, this.dragCurrentY, this.dragElementType);
            while (container !== null && !container.isElementAllowed(this.dragElementType)) {
                container = container.getParent();
            }
            if (container !== null && container.isElementAllowed(this.dragElementType)) {
                let offset = this.elDocContent.offset();
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
                let initialData = { x: '' + x, y: '' + y, containerId: container.getId() };
                let cmd = new AddDeleteDocElementCmd(true, this.dragElementType, initialData,
                    this.rb.getUniqueId(), container.getId(), -1, this.rb);
                this.rb.executeCommand(cmd);
            }
            event.preventDefault();
            $('#rbro_menu_element_drag_item').addClass('rbroHidden');
        }
    }

    processDrag(event) {
        let absPos = getEventAbsPos(event);
        if (this.dragType === DocElement.dragType.element) {
            let container = this.getContainer(
                absPos.x, absPos.y, this.dragElementType);
            let containerId = null;
            if (container !== null) {
                containerId = container.getId();
                if (containerId === this.dragLinkedContainerId) {
                    // container is the same as the linked container of dragged element, this is
                    // the case when dragging container elements like frames
                    container = container.getParent();
                    containerId = (container !== null) ? container.getId() : null;
                }
            }
            if (containerId !== this.dragCurrentContainerId) {
                $('.rbroElementContainer').removeClass('rbroElementDragOver');
                if (container !== null && containerId !== this.dragContainerId) {
                    container.dragOver();
                }
            }
            this.dragCurrentContainerId = containerId;
        }
        this.dragCurrentX = absPos.x;
        this.dragCurrentY = absPos.y;
        this.dragSnapToGrid = !event.ctrlKey;

        let dragObject = this.rb.getDataObject(this.dragObjectId);
        if (dragObject !== null) {
            let dragDiff = dragObject.getDragDiff(
                this.getCoordWithoutZoom(absPos.x - this.dragStartX),
                this.getCoordWithoutZoom(absPos.y - this.dragStartY), this.dragType,
                (this.dragSnapToGrid && this.isGridVisible()) ? this.getGridSize() : 0);
            this.rb.updateSelectionDrag(dragDiff.x, dragDiff.y, this.dragType, null, false);
        }
    }

    updatePageSize(width, height) {
        this.elDoc.css({ width: this.rb.toPixel(width), height: this.rb.toPixel(height) });
    }

    updatePageMargins() {
        let docProperties = this.rb.getDocumentProperties();
        let marginLeft = utils.convertInputToNumber(docProperties.getValue('marginLeft'));
        let marginTop = utils.convertInputToNumber(docProperties.getValue('marginTop'));
        let marginRight = utils.convertInputToNumber(docProperties.getValue('marginRight'));
        let marginBottom = utils.convertInputToNumber(docProperties.getValue('marginBottom'));
        let left = this.rb.toPixel(marginLeft);
        let top = this.rb.toPixel(marginTop - 1);
        let right = this.rb.toPixel(marginRight);
        let bottom = this.rb.toPixel(marginBottom);
        $('#rbro_divider_margin_left').css('left', left);
        $('#rbro_divider_margin_top').css('top', top);
        // hide divider in case margin is 0, otherwise divider is still visible
        if (marginLeft !== 0) {
            $('#rbro_divider_margin_left').css('left', left).show();
        } else {
            $('#rbro_divider_margin_left').hide();
        }
        if (marginTop !== 0) {
            $('#rbro_divider_margin_top').css('top', top).show();
        } else {
            $('#rbro_divider_margin_top').hide();
        }
        if (marginRight !== 0) {
            $('#rbro_divider_margin_right').css('right', right).show();
        } else {
            $('#rbro_divider_margin_right').hide();
        }
        if (marginBottom !== 0) {
            $('#rbro_divider_margin_bottom').css('bottom', bottom).show();
        } else {
            $('#rbro_divider_margin_bottom').hide();
        }
        this.elDocContent.css({ left: left, top: top, right: right, bottom: bottom });
    }

    updateHeader() {
        let docProperties = this.rb.getDocumentProperties();
        if (docProperties.getValue('header')) {
            let headerSize = this.rb.toPixel(docProperties.getValue('headerSize'));
            this.elHeader.css('height', headerSize);
            this.elHeader.show();
            $('#rbro_divider_header').css('top', this.rb.toPixel(
                utils.convertInputToNumber(docProperties.getValue('marginTop')) +
                utils.convertInputToNumber(docProperties.getValue('headerSize')) - 1));
            $('#rbro_divider_header').show();
            this.elContent.css('top', headerSize);
        } else {
            this.elHeader.hide();
            $('#rbro_divider_header').hide();
            this.elContent.css('top', this.rb.toPixel(0));
        }
    }

    updateFooter() {
        let docProperties = this.rb.getDocumentProperties();
        if (docProperties.getValue('footer')) {
            let footerSize = this.rb.toPixel(docProperties.getValue('footerSize'));
            this.elFooter.css('height', footerSize);
            this.elFooter.show();
            $('#rbro_divider_footer').css('bottom', this.rb.toPixel(
                utils.convertInputToNumber(docProperties.getValue('marginBottom')) +
                utils.convertInputToNumber(docProperties.getValue('footerSize'))));
            $('#rbro_divider_footer').show();
            this.elContent.css('bottom', footerSize);
        } else {
            this.elFooter.hide();
            $('#rbro_divider_footer').hide();
            this.elContent.css('bottom', this.rb.toPixel(0));
        }
    }

    setDocumentTab(tab) {
        $('#rbro_document_tabs .rbroDocumentTab').removeClass('rbroActive');
        // use z-index to show pdf preview instead of show/hide of div because otherwise pdf is reloaded (and generated) again
        if (tab === Document.tab.pdfLayout) {
            $('#rbro_document_tab_pdf_layout').addClass('rbroActive');
            this.elDoc.removeClass('rbroHidden');
            $('#rbro_document_pdf_preview').css({ 'z-index': '', 'height': '0' });
            $('.rbroElementButtons .rbroMenuButton').removeClass('rbroDisabled').prop('draggable', true);
            $('.rbroActionButtons .rbroActionButton').prop('disabled', false);
        } else if (this.pdfPreviewExists && tab === Document.tab.pdfPreview) {
            $('#rbro_document_tab_pdf_preview').addClass('rbroActive');
            this.elDoc.addClass('rbroHidden');
            $('#rbro_document_pdf_preview').css({ 'z-index': '1', 'height': '' });
            $('.rbroElementButtons .rbroMenuButton').addClass('rbroDisabled').prop('draggable', false);
            $('.rbroActionButtons .rbroActionButton').prop('disabled', true);
        }
    }

    openPdfPreviewTab(reportUrl, headers) {
        $('#rbro_document_pdf_preview').empty();
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
                        $('#rbro_document_pdf_preview').append($(obj));
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
            const pdfObj =
                '<object data="' + reportUrl + '" type="application/pdf" width="100%" height="100%"></object>';
            $('#rbro_document_pdf_preview').append(pdfObj);
        }

        this.pdfPreviewExists = true;
        this.setDocumentTab(Document.tab.pdfPreview);
        this.updateDocumentTabs();
    }

    closePdfPreviewTab() {
        this.pdfPreviewExists = false;
        $('#rbro_document_pdf_preview').empty();
        this.setDocumentTab(Document.tab.pdfLayout);
        this.updateDocumentTabs();
    }

    updateDocumentTabs() {
        let tabCount = 1;
        if (this.pdfPreviewExists) {
            $('#rbro_document_tab_pdf_preview').removeClass('rbroHidden');
            tabCount++;
        } else {
            $('#rbro_document_tab_pdf_preview').addClass('rbroHidden');
        }
        if (tabCount > 1) {
            $('#rbro_document_tabs').show();
            $('#rbro_document_panel').addClass('rbroHasTabs');
        } else {
            $('#rbro_document_tabs').hide();
            $('#rbro_document_panel').removeClass('rbroHasTabs');
        }
    }

    /**
     * Returns container for given absolute position.
     * @param {Number} absPosX - absolute x position.
     * @param {Number} absPosY - absolute y position.
     * @param {String} elementType - needed for finding container, not all elements are allowed
     * in all containers (e.g. a frame cannot contain another frame).
     * @returns {[Container]} Container or null in case no container was found for given position.
     */
    getContainer(absPosX, absPosY, elementType) {
        let offset = this.elDocContent.offset();
        return this.rb.getContainer(
            this.getCoordWithoutZoom(absPosX - offset.left),
            this.getCoordWithoutZoom(absPosY - offset.top), elementType);
    }

    /**
     * Returns scroll y position of document content.
     * @returns {Number} scroll y position.
     */
    getContentScrollPosY() {
        let contentOffset = this.elDocContent.offset();
        let panelOffset = $('#rbro_document_panel').offset();
        return panelOffset.top - contentOffset.top;
    }

    isGridVisible() {
        return this.gridVisible;
    }

    toggleGrid() {
        this.gridVisible = !this.gridVisible;
        if (this.gridVisible) {
            this.elDocContent.addClass('rbroDocumentGrid');
        } else {
            this.elDocContent.removeClass('rbroDocumentGrid');
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
        let panel = $('#rbro_document_panel');
        let size = this.rb.getDocumentProperties().getPageSize();
        let scaledWidth = size.width * (zoom / 100);
        let scaledHeight = size.height * (zoom / 100);
        let rbWidth = this.rb.getWidth();
        let docPanelWidth = rbWidth - this.rb.getMainPanel().getTotalPanelWidth();
        let docPanelHeight = panel.height();
        let translateX = 0;
        if (zoom !== 100) {
            if (size.width > docPanelWidth) {
                // if there is not enough space in the document panel initially and we zoom out we keep the content
                // in default (top left) position and move it to the center manually
                this.elDoc.css('transform-origin', '');
                if ((zoom < 100) && (scaledWidth < docPanelWidth)) {
                    translateX = Math.round(((docPanelWidth - scaledWidth) / 2));
                }
            } else if (scaledWidth > docPanelWidth) {
                // if there is not enough space in the document panel with zoom level applied
                // we remove any margin and apply the default transformation (top left)
                this.elDoc.css('margin', '0');
                this.elDoc.css('transform-origin', '');
            } else {
                // if there is enough space in the document panel we use the default margin (auto)
                // and apply the transformation from top center
                // so the content is automatically centered in the available horizontal space
                this.elDoc.css('margin', '');
                this.elDoc.css('transform-origin', 'top center');
            }
            this.elDoc.css('transform', `translateX(${translateX}px) scale(${this.zoom / 100})`);
        } else {
            // use default values if no zoom is applied
            this.elDoc.css('margin', '');
            this.elDoc.css('transform', '');
            this.elDoc.css('transform-origin', '');
        }
        $('#rbro_menu_zoom_level').text(zoom + ' %');
        this.rb.getMenuPanel().updateZoomButtons(this.isZoomInPossible(), this.isZoomOutPossible());

        // if there is enough space in the document panel don't show scrollbar
        if (scaledWidth < docPanelWidth) {
            panel.css('overflow-x', 'hidden');
        }  else {
            panel.css('overflow-x', '');
        }
        if (scaledHeight < docPanelHeight) {
            panel.css('overflow-y', 'hidden');
        } else {
            panel.css('overflow-y', '');
        }
    }

    getCoordWithoutZoom(coord) {
        return Math.round(coord * (100 / this.zoom));
    }

    getGridSize() {
        return this.gridSize;
    }

    getHeight() {
        return this.elDocContent.height();
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

    isDragging() {
        return this.dragging;
    }

    isDragged() {
        return this.dragging && ((this.dragStartX !== this.dragCurrentX) || (this.dragStartY !== this.dragCurrentY));
    }

    startDrag(x, y, objectId, containerId, linkedContainerId, elementType, dragType) {
        this.dragging = true;
        this.dragStartX = this.dragCurrentX = x;
        this.dragStartY = this.dragCurrentY = y;
        this.dragElementType = elementType;
        this.dragType = dragType;
        this.dragObjectId = objectId;
        this.dragContainerId = containerId;
        this.dragLinkedContainerId = linkedContainerId;
        this.dragCurrentContainerId = null;
        this.dragSnapToGrid = false;
    }

    stopDrag() {
        let diffX = this.getCoordWithoutZoom(this.dragCurrentX - this.dragStartX);
        let diffY = this.getCoordWithoutZoom(this.dragCurrentY - this.dragStartY);
        let dragObject = this.rb.getDataObject(this.dragObjectId);
        if (dragObject !== null && (diffX !== 0 || diffY !== 0)) {
            let container = null;
            if (this.dragType === DocElement.dragType.element) {
                container = this.rb.getDataObject(this.dragCurrentContainerId);
            }

            // do not allow to change container of elements when multiple elements are
            // dragged together as this could lead to unexpected results for the user
            let selectedObjects = this.rb.getSelectedObjects();
            if (selectedObjects.length > 1 && container !== null) {
                for (let selectedObj of selectedObjects) {
                    if (selectedObj.getContainerId() !== container.getId()) {
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
        $('.rbroElementContainer').removeClass('rbroElementDragOver');
    }

    startBrowserDrag(dragElementType) {
        this.dragEnterCount = 0;
        this.dragObjectId = null;
        this.dragContainerId = null;
        this.dragLinkedContainerId = null;
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
        let area = this.getSelectionArea(x, y);
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
                            let container = docElement.getContainer();
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
        this.elSelectionArea.addClass('rbroHidden');
    }

    getSelectionArea(x, y) {
        let area = {};
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
            let offset = this.elDocContent.offset();
            this.stopSelectionArea(
                this.getCoordWithoutZoom(event.originalEvent.pageX - offset.left),
                this.getCoordWithoutZoom(event.originalEvent.pageY - offset.top),
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

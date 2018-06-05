import AddDeleteDocElementCmd from './commands/AddDeleteDocElementCmd';
import Band from './container/Band';
import DocumentProperties from './data/DocumentProperties';
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
        this.elDocContent = null;
        this.elHeader = null;
        this.elContent = null;
        this.elFooter = null;
        this.elSelectionArea = null;
        this.gridVisible = showGrid;
        this.gridSize = 10;
        this.pdfPreviewExists = false;

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
                    this.rb.deselectAll();
                }
                let offset = this.elDocContent.offset();
                this.startSelectionArea(
                    event.originalEvent.pageX - offset.left, event.originalEvent.pageY - offset.top);
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

        let elDoc = $('<div id="rbro_document_pdf" class="rbroDocument rbroDragTarget rbroHidden"></div>');
        let docProperties = this.rb.getDocumentProperties();
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
        elDoc.append(this.elDocContent);

        this.elSelectionArea = $('<div id="rbro_selection_area" class="rbroHidden rbroSelectionArea"></div>');
        this.elDocContent.append(this.elSelectionArea);

        this.initializeEventHandlers();

        elDoc.append('<div id="rbro_divider_margin_left" class="rbroDivider rbroDividerMarginLeft"></div>');
        elDoc.append('<div id="rbro_divider_margin_top" class="rbroDivider rbroDividerMarginTop"></div>');
        elDoc.append('<div id="rbro_divider_margin_right" class="rbroDivider rbroDividerMarginRight"></div>');
        elDoc.append('<div id="rbro_divider_margin_bottom" class="rbroDivider rbroDividerMarginBottom"></div>');
        elDoc.append('<div id="rbro_divider_header" class="rbroDivider rbroDividerHeader"></div>');
        elDoc.append('<div id="rbro_divider_footer" class="rbroDivider rbroDividerFooter"></div>');
        panel.append(elDoc);

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
        $('#rbro_document_panel').mousemove(event => {
            if (this.dragging) {
                if (this.dragType === DocElement.dragType.element) {
                    let container = this.getContainer(
                        event.originalEvent.pageX, event.originalEvent.pageY, this.dragElementType);
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
                this.dragCurrentX = event.originalEvent.pageX;
                this.dragCurrentY = event.originalEvent.pageY;
                this.dragSnapToGrid = !event.ctrlKey;

                let dragObject = this.rb.getDataObject(this.dragObjectId);
                if (dragObject !== null) {
                    let dragDiff = dragObject.getDragDiff(
                        event.originalEvent.pageX - this.dragStartX,
                        event.originalEvent.pageY - this.dragStartY, this.dragType,
                        (this.dragSnapToGrid && this.isGridVisible()) ? this.getGridSize() : 0);
                    this.rb.updateSelectionDrag(dragDiff.x, dragDiff.y, this.dragType, null, false);
                }
            }
            if (this.selectionAreaStarted) {
                let offset = this.elDocContent.offset();
                let area = this.getSelectionArea(
                    event.originalEvent.pageX - offset.left, event.originalEvent.pageY - offset.top);
                let props = {
                    left: this.rb.toPixel(area.left), top: this.rb.toPixel(area.top),
                    width: this.rb.toPixel(area.width), height: this.rb.toPixel(area.height)};
                this.elSelectionArea.css(props);
                if (this.elSelectionArea.hasClass('rbroHidden')) {
                    // show element after css properties are set
                    this.elSelectionArea.removeClass('rbroHidden');
                }
            }
        });
        this.elDocContent.on('dragover', event => {
            if (this.rb.isBrowserDragActive('docElement')) {
                let container = this.getContainer(
                    event.originalEvent.pageX, event.originalEvent.pageY, this.dragElementType);
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
            if (this.rb.isBrowserDragActive('docElement')) {
                $('.rbroElementContainer').removeClass('rbroElementDragOver');
                let docProperties = this.rb.getDocumentProperties();
                let container = this.getContainer(
                    event.originalEvent.pageX, event.originalEvent.pageY, this.dragElementType);
                while (container !== null && !container.isElementAllowed(this.dragElementType)) {
                    container = container.getParent();
                }
                if (container !== null && container.isElementAllowed(this.dragElementType)) {
                    let offset = this.elDocContent.offset();
                    let x = event.originalEvent.pageX - offset.left;
                    let y = event.originalEvent.pageY - offset.top;
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
                return false;
            }
        });
    }

    updatePageSize(width, height) {
        $('#rbro_document_pdf').css({ width: this.rb.toPixel(width), height: this.rb.toPixel(height) });
    }

    updatePageMargins() {
        let docProperties = this.rb.getDocumentProperties();
        let left = this.rb.toPixel(utils.convertInputToNumber(docProperties.getValue('marginLeft')) - 1);
        let top = this.rb.toPixel(utils.convertInputToNumber(docProperties.getValue('marginTop')) - 1);
        let marginRight = utils.convertInputToNumber(docProperties.getValue('marginRight'));
        let marginBottom = utils.convertInputToNumber(docProperties.getValue('marginBottom'));
        let right = this.rb.toPixel(marginRight);
        let bottom = this.rb.toPixel(marginBottom);
        $('#rbro_divider_margin_left').css('left', left);
        $('#rbro_divider_margin_top').css('top', top);
        // hide right/bottom divider in case margin is 0, otherwise divider is still visible
        // because it is one pixel to the left/top of document border
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
            $('#rbro_document_pdf').removeClass('rbroHidden');
            $('#rbro_document_pdf_preview').css('z-index', '');
            $('.rbroElementButtons .rbroMenuButton').removeClass('rbroDisabled').prop('draggable', true);
            $('.rbroActionButtons .rbroActionButton').prop('disabled', false);
        } else if (this.pdfPreviewExists && tab === Document.tab.pdfPreview) {
            $('#rbro_document_tab_pdf_preview').addClass('rbroActive');
            $('#rbro_document_pdf').addClass('rbroHidden');
            $('#rbro_document_pdf_preview').css('z-index', '1');
            $('.rbroElementButtons .rbroMenuButton').addClass('rbroDisabled').prop('draggable', false);
            $('.rbroActionButtons .rbroActionButton').prop('disabled', true);
        }
    }

    openPdfPreviewTab(reportUrl) {
        let pdfObj = '<object data="' + reportUrl + '" type="application/pdf" width="100%" height="100%"></object>';
        this.pdfPreviewExists = true;
        $('#rbro_document_pdf_preview').empty();
        $('#rbro_document_pdf_preview').append(pdfObj);
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
        return this.rb.getContainer(absPosX - offset.left, absPosY - offset.top, elementType);
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
        let diffX = this.dragCurrentX - this.dragStartX;
        let diffY = this.dragCurrentY - this.dragStartY;
        let dragObject = this.rb.getDataObject(this.dragObjectId);
        if (dragObject !== null && (diffX !== 0 || diffY !== 0)) {
            let container = null;
            if (this.dragType === DocElement.dragType.element) {
                container = this.rb.getDataObject(this.dragCurrentContainerId);
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
                // do not select table text and table band elements
                if (docElement.isDraggingAllowed()) {
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
                event.originalEvent.pageX - offset.left,
                event.originalEvent.pageY - offset.top,
                !event.shiftKey);
        }
    }
}

Document.tab = {
    pdfLayout: 'pdfLayout',
    pdfPreview: 'pdfPreview'
};

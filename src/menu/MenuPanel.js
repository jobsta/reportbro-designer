import Style from '../data/Style';
import DocElement from '../elements/DocElement';
import TableTextElement from '../elements/TableTextElement';
import * as utils from '../utils';

/**
 * The menu panel contains all menu buttons.
 * @class
 */
export default class MenuPanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
    }

    render() {
        let menuShowButtonLabels = this.rb.getProperty('menuShowButtonLabels');
        let menuButtonClass = menuShowButtonLabels ? '' : 'rbroHidden';
        let panel = document.getElementById('rbro_menu_panel');
        let elMenuButton;
        let panelLeft = utils.createElement('div', { class: 'rbroToolButtonContainer' });
        elMenuButton = utils.createElement(
            'button', {
                id: 'rbro_menu_save',
                class: 'rbroButton rbroMenuButton',
                title: this.rb.getLabel('menuSaveTip')
            });
        elMenuButton.append(utils.createElement('span', { class: 'rbroIcon-save' }));
        elMenuButton.append(utils.createElement('span', { class: menuButtonClass }, this.rb.getLabel('menuSave')));
        elMenuButton.addEventListener('click', (event) => {
            this.rb.save();
        });
        if (!(this.rb.getProperty('saveCallback') || this.rb.getProperty('localStorageReportKey'))) {
            elMenuButton.style.display = 'none';
        }
        panelLeft.append(elMenuButton);

        if (this.rb.getProperty('menuShowDebug')) {
            elMenuButton = utils.createElement(
                'button', {
                    id: 'rbro_menu_log_report',
                    class: 'rbroButton rbroMenuButton',
                    title: this.rb.getLabel('menuLogReportTip')
                });
            elMenuButton.append(utils.createElement('span', { class: 'rbroIcon-console' }));
            elMenuButton.append(
                utils.createElement('span', { class: 'rbroHidden' }, this.rb.getLabel('menuLogReport')));
            elMenuButton.addEventListener('click', (event) => {
                console.log(JSON.stringify(this.rb.getReport()));
            });
            panelLeft.append(elMenuButton);

            elMenuButton = utils.createElement(
                'button', {
                    id: 'rbro_menu_insert_report',
                    class: 'rbroButton rbroMenuButton',
                    title: this.rb.getLabel('menuInsertReportTip')
                });
            elMenuButton.append(utils.createElement('span', { class: 'rbroIcon-insert-report' }));
            elMenuButton.append(
                utils.createElement('span', { class: 'rbroHidden' }, this.rb.getLabel('menuInsertReport')));
            elMenuButton.addEventListener('click', (event) => {
                let strReport = prompt('Paste report template here to load report');
                if (strReport) {
                    try {
                        let report = JSON.parse(strReport);
                        if (typeof report.docElements === "object" && typeof report.parameters === "object" &&
                                typeof report.styles === "object" && typeof report.documentProperties === "object") {
                            this.rb.load(report);
                            this.rb.setModified(true);
                        } else {
                            alert('Invalid report template data');
                        }
                    } catch (e) {
                        alert('Invalid report template data');
                    }

                }
            });
            panelLeft.append(elMenuButton);
        }

        elMenuButton = utils.createElement(
            'button', {
                id: 'rbro_menu_undo',
                class: 'rbroButton rbroMenuButton',
                title: this.rb.getLabel('menuUndoTip')
            });
        elMenuButton.append(utils.createElement('span', { class: 'rbroIcon-undo' }));
        elMenuButton.append(utils.createElement('span', { class: menuButtonClass }, this.rb.getLabel('menuUndo')));
        elMenuButton.addEventListener('click', (event) => {
            this.rb.undoCommand();
        });
        panelLeft.append(elMenuButton);

        elMenuButton = utils.createElement(
            'button', {
                id: 'rbro_menu_redo',
                class: 'rbroButton rbroMenuButton',
                title: this.rb.getLabel('menuRedoTip')
            });
        elMenuButton.append(utils.createElement('span', { class: 'rbroIcon-redo' }));
        elMenuButton.append(utils.createElement('span', { class: menuButtonClass }, this.rb.getLabel('menuRedo')));
        elMenuButton.addEventListener('click', (event) => {
            this.rb.redoCommand();
        });
        panelLeft.append(elMenuButton);

        elMenuButton = utils.createElement(
            'button', {
                id: 'rbro_menu_preview',
                class: 'rbroButton rbroMenuButton',
                title: this.rb.getLabel('menuPreviewTip')
            });
        elMenuButton.append(utils.createElement('span', { class: 'rbroIcon-play' }));
        elMenuButton.append(utils.createElement('span', { class: menuButtonClass }, this.rb.getLabel('menuPreview')));
        elMenuButton.addEventListener('click', (event) => {
            this.rb.preview();
        });
        panelLeft.append(elMenuButton);
        panel.append(panelLeft);

        let panelRight = utils.createElement('div', { class: 'rbroElementButtonContainer' });
        let elElementsDiv = utils.createElement('div', { id: 'rbo_menu_elements', class: 'rbroElementButtons' });
        let elMenuElement;

        elMenuElement = utils.createElement(
            'div', {
                id: 'rbro_menu_element_text',
                class: 'rbroButton rbroMenuButton',
                draggle: 'true',
                title: this.rb.getLabel('docElementText')
            });
        elMenuElement.append(utils.createElement('span', { class: 'rbroIcon-text' }));
        elMenuElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', '');  // without setData dragging does not work in FF
            event.dataTransfer.effectAllowed = 'copy';

            this.rb.startBrowserDrag('docElement', DocElement.type.text, '');

            // avoid calling dragstart handler for main div which disables dragging for all other elements
            event.stopPropagation();
        });
        elMenuElement.addEventListener('touchstart', (event) => {
            this.rb.startBrowserDrag('docElement', DocElement.type.text, '');

            // keep the browser from continuing to process the touch event
            // (this also prevents a mouse event from being delivered).
            event.preventDefault();
        });
        elMenuElement.addEventListener('touchmove', (event) => {
            this.rb.getDocument().processDragover(event);
        });
        elMenuElement.addEventListener('touchend', (event) => {
            this.rb.getDocument().processDrop(event);
        });
        elElementsDiv.append(elMenuElement);

        elMenuElement = utils.createElement(
            'div', {
                id: 'rbro_menu_element_line',
                class: 'rbroButton rbroMenuButton',
                draggle: 'true',
                title: this.rb.getLabel('docElementLine')
            });
        elMenuElement.append(utils.createElement('span', { class: 'rbroIcon-line' }));
        elMenuElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', '');
            event.dataTransfer.effectAllowed = 'copy';
            this.rb.startBrowserDrag('docElement', DocElement.type.line, '');
            event.stopPropagation();
        });
        elMenuElement.addEventListener('touchstart', (event) => {
            this.rb.startBrowserDrag('docElement', DocElement.type.line, '');
            event.preventDefault();
        });
        elMenuElement.addEventListener('touchmove', (event) => {
            this.rb.getDocument().processDragover(event);
        });
        elMenuElement.addEventListener('touchend', (event) => {
            this.rb.getDocument().processDrop(event);
        });
        elElementsDiv.append(elMenuElement);

        elMenuElement = utils.createElement(
            'div', {
                id: 'rbro_menu_element_image',
                class: 'rbroButton rbroMenuButton',
                draggle: 'true',
                title: this.rb.getLabel('docElementImage')
            });
        elMenuElement.append(utils.createElement('span', { class: 'rbroIcon-image' }));
        elMenuElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', '');
            event.dataTransfer.effectAllowed = 'copy';
            this.rb.startBrowserDrag('docElement', DocElement.type.image, '');
            event.stopPropagation();
        });
        elMenuElement.addEventListener('touchstart', (event) => {
            this.rb.startBrowserDrag('docElement', DocElement.type.image, '');
            event.preventDefault();
        });
        elMenuElement.addEventListener('touchmove', (event) => {
            this.rb.getDocument().processDragover(event);
        });
        elMenuElement.addEventListener('touchend', (event) => {
            this.rb.getDocument().processDrop(event);
        });
        elElementsDiv.append(elMenuElement);

        elMenuElement = utils.createElement(
            'div', {
                id: 'rbro_menu_element_bar_code',
                class: 'rbroButton rbroMenuButton',
                draggle: 'true',
                title: this.rb.getLabel('docElementBarCode')
            });
        elMenuElement.append(utils.createElement('span', { class: 'rbroIcon-barcode' }));
        elMenuElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', '');
            event.dataTransfer.effectAllowed = 'copy';
            this.rb.startBrowserDrag('docElement', DocElement.type.barCode, '');
            event.stopPropagation();
        });
        elMenuElement.addEventListener('touchstart', (event) => {
            this.rb.startBrowserDrag('docElement', DocElement.type.barCode, '');
            event.preventDefault();
        });
        elMenuElement.addEventListener('touchmove', (event) => {
            this.rb.getDocument().processDragover(event);
        });
        elMenuElement.addEventListener('touchend', (event) => {
            this.rb.getDocument().processDrop(event);
        });
        elElementsDiv.append(elMenuElement);

        elMenuElement = utils.createElement(
            'div', {
                id: 'rbro_menu_element_table',
                class: 'rbroButton rbroMenuButton',
                draggle: 'true',
                title: this.rb.getLabel('docElementTable')
            });
        elMenuElement.append(utils.createElement('span', { class: 'rbroIcon-table' }));
        elMenuElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', '');
            event.dataTransfer.effectAllowed = 'copy';
            this.rb.startBrowserDrag('docElement', DocElement.type.table, '');
            event.stopPropagation();
        });
        elMenuElement.addEventListener('touchstart', (event) => {
            this.rb.startBrowserDrag('docElement', DocElement.type.table, '');
            event.preventDefault();
        });
        elMenuElement.addEventListener('touchmove', (event) => {
            this.rb.getDocument().processDragover(event);
        });
        elMenuElement.addEventListener('touchend', (event) => {
            this.rb.getDocument().processDrop(event);
        });
        elElementsDiv.append(elMenuElement);

        elMenuElement = utils.createElement(
            'div', {
                id: 'rbro_menu_element_frame',
                class: 'rbroButton rbroMenuButton',
                draggle: 'true',
                title: this.rb.getLabel('docElementFrame')
            });
        elMenuElement.append(utils.createElement('span', { class: 'rbroIcon-frame' }));
        elMenuElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', '');
            event.dataTransfer.effectAllowed = 'copy';
            this.rb.startBrowserDrag('docElement', DocElement.type.frame, '');
            event.stopPropagation();
        });
        elMenuElement.addEventListener('touchstart', (event) => {
            this.rb.startBrowserDrag('docElement', DocElement.type.frame, '');
            event.preventDefault();
        });
        elMenuElement.addEventListener('touchmove', (event) => {
            this.rb.getDocument().processDragover(event);
        });
        elMenuElement.addEventListener('touchend', (event) => {
            this.rb.getDocument().processDrop(event);
        });
        elElementsDiv.append(elMenuElement);

        elMenuElement = utils.createElement(
            'div', {
                id: 'rbro_menu_element_section',
                class: 'rbroButton rbroMenuButton',
                draggle: 'true',
                title: this.rb.getLabel('docElementSection')
            });
        elMenuElement.append(utils.createElement('span', { class: 'rbroIcon-section' }));
        elMenuElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', '');
            event.dataTransfer.effectAllowed = 'copy';
            this.rb.startBrowserDrag('docElement', DocElement.type.section, '');
            event.stopPropagation();
        });
        elMenuElement.addEventListener('touchstart', (event) => {
            this.rb.startBrowserDrag('docElement', DocElement.type.section, '');
            event.preventDefault();
        });
        elMenuElement.addEventListener('touchmove', (event) => {
            this.rb.getDocument().processDragover(event);
        });
        elMenuElement.addEventListener('touchend', (event) => {
            this.rb.getDocument().processDrop(event);
        });
        elElementsDiv.append(elMenuElement);

        elMenuElement = utils.createElement(
            'div', {
                id: 'rbro_menu_element_page_break',
                class: 'rbroButton rbroMenuButton',
                draggle: 'true',
                title: this.rb.getLabel('docElementPageBreak')
            });
        elMenuElement.append(utils.createElement('span', { class: 'rbroIcon-page-break' }));
        elMenuElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', '');
            event.dataTransfer.effectAllowed = 'copy';
            this.rb.startBrowserDrag('docElement', DocElement.type.pageBreak, '');
            event.stopPropagation();
        });
        elMenuElement.addEventListener('touchstart', (event) => {
            this.rb.startBrowserDrag('docElement', DocElement.type.pageBreak, '');
            event.preventDefault();
        });
        elMenuElement.addEventListener('touchmove', (event) => {
            this.rb.getDocument().processDragover(event);
        });
        elMenuElement.addEventListener('touchend', (event) => {
            this.rb.getDocument().processDrop(event);
        });
        elElementsDiv.append(elMenuElement);

        panelRight.append(elElementsDiv);

        let elActionsDiv = utils.createElement('div', { class: 'rbroActionButtons' });
        let elAlignDiv = utils.createElement('div', { id: 'rbro_menu_align', style: 'display: none;' });
        let elAlignLeft = utils.createElement(
            'button', {
                id: 'rbro_menu_align_left',
                class: 'rbroButton rbroActionButton rbroIcon-align-left',
                type: 'button',
                title: this.rb.getLabel('menuAlignLeft')
            });
        elAlignLeft.addEventListener('click', (event) => {
            this.rb.alignSelections(Style.alignment.left);
        });
        elAlignDiv.append(elAlignLeft);
        let elAlignCenter = utils.createElement(
            'button', {
                id: 'rbro_menu_align_center',
                class: 'rbroButton rbroActionButton rbroIcon-align-center',
                type: 'button',
                title: this.rb.getLabel('menuAlignCenter')
            });
        elAlignCenter.addEventListener('click', (event) => {
            this.rb.alignSelections(Style.alignment.center);
        });
        elAlignDiv.append(elAlignCenter);
        let elAlignRight = utils.createElement(
            'button', {
                id: 'rbro_menu_align_right',
                class: 'rbroButton rbroActionButton rbroIcon-align-right',
                type: 'button',
                title: this.rb.getLabel('menuAlignRight')
            });
        elAlignRight.addEventListener('click', (event) => {
            this.rb.alignSelections(Style.alignment.right);
        });
        elAlignDiv.append(elAlignRight);
        elActionsDiv.append(elAlignDiv);
        let elVAlignDiv = utils.createElement('div', { id: 'rbro_menu_valign', style: 'display: none;' });
        let elAlignTop = utils.createElement(
            'button', {
                id: 'rbro_menu_align_top',
                class: 'rbroButton rbroActionButton rbroIcon-align-top',
                type: 'button',
                title: this.rb.getLabel('menuAlignTop')
            });
        elAlignTop.addEventListener('click', (event) => {
            this.rb.alignSelections(Style.alignment.top);
        });
        elVAlignDiv.append(elAlignTop);
        let elAlignMiddle = utils.createElement(
            'button', {
                id: 'rbro_menu_align_middle',
                class: 'rbroButton rbroActionButton rbroIcon-align-middle',
                type: 'button',
                title: this.rb.getLabel('menuAlignMiddle')
            });
        elAlignMiddle.addEventListener('click', (event) => {
            this.rb.alignSelections(Style.alignment.middle);
        });
        elVAlignDiv.append(elAlignMiddle);
        let elAlignBottom = utils.createElement(
            'button', {
                id: 'rbro_menu_align_bottom',
                class: 'rbroButton rbroActionButton rbroIcon-align-bottom',
                type: 'button',
                title: this.rb.getLabel('menuAlignBottom')
            });
        elAlignBottom.addEventListener('click', (event) => {
                this.rb.alignSelections(Style.alignment.bottom);
            });
        elVAlignDiv.append(elAlignBottom);
        elActionsDiv.append(elVAlignDiv);

        let elColumnActionsDiv = utils.createElement(
            'div', { id: 'rbro_menu_column_actions', style: 'display: none;' });
        let elColumnAddLeft = utils.createElement(
            'button', {
                id: 'rbro_menu_column_add_left',
                class: 'rbroButton rbroActionButton rbroIcon-column-add-left',
                type: 'button',
                title: this.rb.getLabel('menuColumnAddLeft')
            });
        elColumnAddLeft.addEventListener('click', (event) => {
            let obj = this.rb.getSelectedObject();
            if (obj instanceof TableTextElement) {
                obj.insertColumn(true);
            }
        });
        elColumnActionsDiv.append(elColumnAddLeft);
        let elColumnAddRight = utils.createElement(
            'button', {
                id: 'rbro_menu_column_add_right',
                class: 'rbroButton rbroActionButton rbroIcon-column-add-right',
                type: 'button',
                title: this.rb.getLabel('menuColumnAddRight')
            });
        elColumnAddRight.addEventListener('click', (event) => {
            let obj = this.rb.getSelectedObject();
            if (obj instanceof TableTextElement) {
                obj.insertColumn(false);
            }
        });
        elColumnActionsDiv.append(elColumnAddRight);
        let elColumnDelete = utils.createElement(
            'button', {
                id: 'rbro_menu_column_delete',
                class: 'rbroButton rbroActionButton rbroIcon-column-delete',
                type: 'button',
                title: this.rb.getLabel('menuColumnDelete')
            });
        elColumnDelete.addEventListener('click', (event) => {
            let obj = this.rb.getSelectedObject();
            if (obj instanceof TableTextElement) {
                obj.deleteColumn();
            }
        });
        elColumnActionsDiv.append(elColumnDelete);
        elActionsDiv.append(elColumnActionsDiv);

        let elRowActionsDiv = utils.createElement('div', { id: 'rbro_menu_row_actions', style: 'display: none;' });
        let elRowAddAbove = utils.createElement(
            'button', {
                id: 'rbro_menu_row_add_above',
                class: 'rbroButton rbroActionButton rbroIcon-row-add-above',
                type: 'button',
                title: this.rb.getLabel('menuRowAddAbove')
            });
        elRowAddAbove.addEventListener('click', (event) => {
            let obj = this.rb.getSelectedObject();
            if (obj instanceof TableTextElement && obj.getParent() !== null) {
                obj.getParent().insertRow(true);
            }
        });
        elRowActionsDiv.append(elRowAddAbove);
        let elRowAddBelow = utils.createElement(
            'button', {
                id: 'rbro_menu_row_add_below',
                class: 'rbroButton rbroActionButton rbroIcon-row-add-below',
                type: 'button',
                title: this.rb.getLabel('menuRowAddBelow')
            });
        elRowAddBelow.addEventListener('click', (event) => {
            let obj = this.rb.getSelectedObject();
            if (obj instanceof TableTextElement && obj.getParent() !== null) {
                obj.getParent().insertRow(false);
            }
        });
        elRowActionsDiv.append(elRowAddBelow);
        let elRowDelete = utils.createElement(
            'button', {
                id: 'rbro_menu_row_delete',
                class: 'rbroButton rbroActionButton rbroIcon-row-delete',
                type: 'button',
                title: this.rb.getLabel('menuRowDelete')
            });
        elRowDelete.addEventListener('click', (event) => {
            let obj = this.rb.getSelectedObject();
            if (obj instanceof TableTextElement && obj.getParent() !== null) {
                obj.getParent().deleteRow();
            }
        });
        elRowActionsDiv.append(elRowDelete);
        elActionsDiv.append(elRowActionsDiv);

        let elZoomDiv = utils.createElement('div', { id: 'rbro_menu_zoom', class: 'rbroZoom' });
        elZoomDiv.append(utils.createElement('span', { id: 'rbro_menu_zoom_level', class: 'rbroZoomLevel' }));
        let elMenuZoomIn = utils.createElement(
            'button', {
                id: 'rbro_menu_zoom_in',
                class: 'rbroButton rbroRoundButton rbroZoomButton rbroIcon-plus' +
                    (!this.rb.getDocument().isZoomInPossible() ? ' rbroButtonInactive' : ''),
                type: 'button',
                title: this.rb.getLabel('menuZoomIn')
            });
        elMenuZoomIn.addEventListener('click', (event) => {
            this.rb.getDocument().zoomIn();
        });
        elZoomDiv.append(elMenuZoomIn);
        let elMenuZoomOut = utils.createElement(
            'button', {
                id: 'rbro_menu_zoom_out',
                class: 'rbroButton rbroRoundButton rbroZoomButton rbroIcon-minus' +
                    (!this.rb.getDocument().isZoomOutPossible() ? ' rbroButtonInactive' : ''),
                type: 'button',
                title: this.rb.getLabel('menuZoomOut')
            });
        elMenuZoomOut.addEventListener('click', (event) => {
            this.rb.getDocument().zoomOut();
        });
        elZoomDiv.append(elMenuZoomOut);
        elActionsDiv.append(elZoomDiv);

        let elMenuToggleGrid = utils.createElement(
            'button', {
                id: 'rbro_menu_toggle_grid',
                class: 'rbroButton rbroGridButton rbroActionButton rbroIcon-grid' +
                    (this.rb.getProperty('showGrid') ? ' rbroButtonActive' : ''),
                type: 'button',
                title: this.rb.getLabel('menuToggleGrid')
            });
        elMenuToggleGrid.addEventListener('click', (event) => {
            elMenuToggleGrid.classList.toggle('rbroButtonActive');
            this.rb.getDocument().toggleGrid();
        });
        elActionsDiv.append(elMenuToggleGrid);

        panelRight.append(elActionsDiv);
        panel.append(panelRight);
    }

    updateZoomButtons(zoomInPossible, zoomOutPossible) {
        if (zoomInPossible) {
            document.getElementById('rbro_menu_zoom_in').removeAttribute('disabled');
        } else {
            document.getElementById('rbro_menu_zoom_in').setAttribute('disabled', 'disabled');
        }
        if (zoomOutPossible) {
            document.getElementById('rbro_menu_zoom_out').removeAttribute('disabled');
        } else {
            document.getElementById('rbro_menu_zoom_out').setAttribute('disabled', 'disabled');
        }
    }
}

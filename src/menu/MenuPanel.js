import Style from '../data/Style';
import DocElement from '../elements/DocElement';
import TableTextElement from '../elements/TableTextElement';
import {getEventAbsPos} from "../utils";

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
        let panel = $('#rbro_menu_panel');
        let panelLeft = $('<div class="rbroToolButtonContainer"></div>');
        if (this.rb.getProperty('saveCallback') || this.rb.getProperty('localStorageReportKey')) {
            panelLeft.append($(`<button id="rbro_menu_save" class="rbroButton rbroMenuButton" title="${this.rb.getLabel('menuSaveTip')}">
                    <span class="rbroIcon-save"></span><span class="${menuButtonClass}">${this.rb.getLabel('menuSave')}</span></button>`)
                .click(event => {
                    this.rb.save();
                })
            );
        }
        if (this.rb.getProperty('menuShowDebug')) {
            panelLeft.append($(`<button id="rbro_menu_log_report" class="rbroButton rbroMenuButton" title="${this.rb.getLabel('menuLogReportTip')}">
                    <span class="rbroIcon-console"></span><span class="rbroHidden">${this.rb.getLabel('menuLogReport')}</span></button>`)
                .click(event => {
                    console.log(JSON.stringify(this.rb.getReport()));
                })
            );
            panelLeft.append($(`<button id="rbro_menu_insert_report" class="rbroButton rbroMenuButton" title="${this.rb.getLabel('menuInsertReportTip')}">
                    <span class="rbroIcon-insert-report"></span><span class="rbroHidden">${this.rb.getLabel('menuInsertReport')}</span></button>`)
                .click(event => {
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
                })
            );
        }
        panelLeft.append($(`<button id="rbro_menu_undo" class="rbroButton rbroMenuButton" title="${this.rb.getLabel('menuUndoTip')}">
                <span class="rbroIcon-undo"></span><span class="${menuButtonClass}">${this.rb.getLabel('menuUndo')}</span></button>`)
            .click(event => {
                this.rb.undoCommand();
            })
        );
        panelLeft.append($(`<button id="rbro_menu_redo" class="rbroButton rbroMenuButton" title="${this.rb.getLabel('menuRedoTip')}">
                <span class="rbroIcon-redo"></span><span class="${menuButtonClass}">${this.rb.getLabel('menuRedo')}</span></button>`)
            .click(event => {
                this.rb.redoCommand();
            })
        );
        panelLeft.append($(`<button id="rbro_menu_preview" class="rbroButton rbroMenuButton" title="${this.rb.getLabel('menuPreviewTip')}">
                <span class="rbroIcon-play"></span><span class="${menuButtonClass}">${this.rb.getLabel('menuPreview')}</span></button>`)
            .click(event => {
                this.rb.preview();
            })
        );
        panel.append(panelLeft);

        let panelRight = $('<div class="rbroElementButtonContainer"></div>');
        let elElementsDiv = $('<div id="rbo_menu_elements" class="rbroElementButtons"></div>');

        elElementsDiv.append($(`<div id="rbro_menu_element_text" class="rbroButton rbroMenuButton" draggable="true"
                title="${this.rb.getLabel('docElementText')}">
                    <span class="rbroIcon-text"></span>
                </div>`)
            .on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');  // without setData dragging does not work in FF
                event.originalEvent.dataTransfer.effectAllowed = 'copy';

                this.rb.startBrowserDrag('docElement', DocElement.type.text, '');

                // avoid calling dragstart handler for main div which disables dragging for all other elements
                event.stopPropagation();
            })
            .on('touchstart', event => {
                this.rb.startBrowserDrag('docElement', DocElement.type.text, '');

                // keep the browser from continuing to process the touch event
                // (this also prevents a mouse event from being delivered).
                event.preventDefault();
            })
            .on('touchmove', event => {
                this.rb.getDocument().processDragover(event);
            })
            .on('touchend', event => {
                this.rb.getDocument().processDrop(event);
            })
        );

        elElementsDiv.append($(`<div id="rbro_menu_element_line" class="rbroButton rbroMenuButton" draggable="true"
                title="${this.rb.getLabel('docElementLine')}">
                    <span class="rbroIcon-line"></span>
                </div>`)
            .on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');
                event.originalEvent.dataTransfer.effectAllowed = 'copy';
                this.rb.startBrowserDrag('docElement', DocElement.type.line, '');
                event.stopPropagation();
            })
            .on('touchstart', event => {
                this.rb.startBrowserDrag('docElement', DocElement.type.line, '');
                event.preventDefault();
            })
            .on('touchmove', event => {
                this.rb.getDocument().processDragover(event);
            })
            .on('touchend', event => {
                this.rb.getDocument().processDrop(event);
            })
        );

        elElementsDiv.append($(`<div id="rbro_menu_element_image" class="rbroButton rbroMenuButton" draggable="true"
                title="${this.rb.getLabel('docElementImage')}">
                    <span class="rbroIcon-image"></span>
                </div>`)
            .on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');
                event.originalEvent.dataTransfer.effectAllowed = 'copy';
                this.rb.startBrowserDrag('docElement', DocElement.type.image, '');
                event.stopPropagation();
            })
            .on('touchstart', event => {
                this.rb.startBrowserDrag('docElement', DocElement.type.image, '');
                event.preventDefault();
            })
            .on('touchmove', event => {
                this.rb.getDocument().processDragover(event);
            })
            .on('touchend', event => {
                this.rb.getDocument().processDrop(event);
            })
        );

        elElementsDiv.append($(`<div id="rbro_menu_element_bar_code" class="rbroButton rbroMenuButton" draggable="true"
                title="${this.rb.getLabel('docElementBarCode')}">
                    <span class="rbroIcon-barcode"></span>
                </div>`)
            .on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');
                event.originalEvent.dataTransfer.effectAllowed = 'copy';
                this.rb.startBrowserDrag('docElement', DocElement.type.barCode, '');
                event.stopPropagation();
            })
            .on('touchstart', event => {
                this.rb.startBrowserDrag('docElement', DocElement.type.barCode, '');
                event.preventDefault();
            })
            .on('touchmove', event => {
                this.rb.getDocument().processDragover(event);
            })
            .on('touchend', event => {
                this.rb.getDocument().processDrop(event);
            })
        );
        elElementsDiv.append($(`<div id="rbro_menu_element_table" class="rbroButton rbroMenuButton" draggable="true"
                title="${this.rb.getLabel('docElementTable')}">
                    <span class="rbroIcon-table"></span>
                </div>`)
            .on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');
                event.originalEvent.dataTransfer.effectAllowed = 'copy';
                this.rb.startBrowserDrag('docElement', DocElement.type.table, '');
                event.stopPropagation();
            })
            .on('touchstart', event => {
                this.rb.startBrowserDrag('docElement', DocElement.type.table, '');
                event.preventDefault();
            })
            .on('touchmove', event => {
                this.rb.getDocument().processDragover(event);
            })
            .on('touchend', event => {
                this.rb.getDocument().processDrop(event);
            })
        );

        elElementsDiv.append($(`<div id="rbro_menu_element_frame" class="rbroButton rbroMenuButton" draggable="true"
                title="${this.rb.getLabel('docElementFrame')}">
                    <span class="rbroIcon-frame"></span>
                </div>`)
            .on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');
                event.originalEvent.dataTransfer.effectAllowed = 'copy';
                this.rb.startBrowserDrag('docElement', DocElement.type.frame, '');
                event.stopPropagation();
            })
            .on('touchstart', event => {
                this.rb.startBrowserDrag('docElement', DocElement.type.frame, '');
                event.preventDefault();
            })
            .on('touchmove', event => {
                this.rb.getDocument().processDragover(event);
            })
            .on('touchend', event => {
                this.rb.getDocument().processDrop(event);
            })
        );

        elElementsDiv.append($(`<div id="rbro_menu_element_section" class="rbroButton rbroMenuButton" draggable="true"
                title="${this.rb.getLabel('docElementSection')}">
                    <span class="rbroIcon-section"></span>
                </div>`)
            .on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');
                event.originalEvent.dataTransfer.effectAllowed = 'copy';
                this.rb.startBrowserDrag('docElement', DocElement.type.section, '');
                event.stopPropagation();
            })
            .on('touchstart', event => {
                this.rb.startBrowserDrag('docElement', DocElement.type.section, '');
                event.preventDefault();
            })
            .on('touchmove', event => {
                this.rb.getDocument().processDragover(event);
            })
            .on('touchend', event => {
                this.rb.getDocument().processDrop(event);
            })
        );

        elElementsDiv.append($(`<div id="rbro_menu_element_page_break" class="rbroButton rbroMenuButton" draggable="true"
                title="${this.rb.getLabel('docElementPageBreak')}">
                    <span class="rbroIcon-page-break"></span>
                </div>`)
            .on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');
                event.originalEvent.dataTransfer.effectAllowed = 'copy';
                this.rb.startBrowserDrag('docElement', DocElement.type.pageBreak, '');
                event.stopPropagation();
            })
            .on('touchstart', event => {
                this.rb.startBrowserDrag('docElement', DocElement.type.pageBreak, '');
                event.preventDefault();
            })
            .on('touchmove', event => {
                this.rb.getDocument().processDragover(event);
            })
            .on('touchend', event => {
                this.rb.getDocument().processDrop(event);
            })
        );

        panelRight.append(elElementsDiv);

        let elActionsDiv = $('<div class="rbroActionButtons"></div>');
        let elAlignDiv = $('<div id="rbro_menu_align" style="display: none;"></div>');
        let elAlignLeft = $(`<button id="rbro_menu_align_left"
                class="rbroButton rbroActionButton rbroIcon-align-left" type="button"
                title="${this.rb.getLabel('menuAlignLeft')}"></button>`)
            .click(event => {
                this.rb.alignSelections(Style.alignment.left);
            });
        elAlignDiv.append(elAlignLeft);
        let elAlignCenter = $(`<button id="rbro_menu_align_center"
                class="rbroButton rbroActionButton rbroIcon-align-center" type="button"
                title="${this.rb.getLabel('menuAlignCenter')}"></button>`)
            .click(event => {
                this.rb.alignSelections(Style.alignment.center);
            });
        elAlignDiv.append(elAlignCenter);
        let elAlignRight = $(`<button id="rbro_menu_align_right"
                class="rbroButton rbroActionButton rbroIcon-align-right" type="button"
                title="${this.rb.getLabel('menuAlignRight')}"></button>`)
            .click(event => {
                this.rb.alignSelections(Style.alignment.right);
            });
        elAlignDiv.append(elAlignRight);
        elActionsDiv.append(elAlignDiv);
        let elVAlignDiv = $('<div id="rbro_menu_valign" style="display: none;"></div>');
        let elAlignTop = $(`<button id="rbro_menu_align_top"
                class="rbroButton rbroActionButton rbroIcon-align-top" type="button"
                title="${this.rb.getLabel('menuAlignTop')}"></button>`)
            .click(event => {
                this.rb.alignSelections(Style.alignment.top);
            });
        elVAlignDiv.append(elAlignTop);
        let elAlignMiddle = $(`<button id="rbro_menu_align_middle"
                class="rbroButton rbroActionButton rbroIcon-align-middle" type="button"
                title="${this.rb.getLabel('menuAlignMiddle')}"></button>`)
            .click(event => {
                this.rb.alignSelections(Style.alignment.middle);
            });
        elVAlignDiv.append(elAlignMiddle);
        let elAlignBottom = $(`<button id="rbro_menu_align_bottom"
                class="rbroButton rbroActionButton rbroIcon-align-bottom" type="button"
                title="${this.rb.getLabel('menuAlignBottom')}"></button>`)
            .click(event => {
                this.rb.alignSelections(Style.alignment.bottom);
            });
        elVAlignDiv.append(elAlignBottom);
        elActionsDiv.append(elVAlignDiv);

        let elColumnActionsDiv = $('<div id="rbro_menu_column_actions" style="display: none;"></div>');
        let elColumnAddLeft = $(`<button id="rbro_menu_column_add_left"
                class="rbroButton rbroActionButton rbroIcon-column-add-left" type="button"
                title="${this.rb.getLabel('menuColumnAddLeft')}"></button>`)
            .click(event => {
                let obj = this.rb.getSelectedObject();
                if (obj instanceof TableTextElement) {
                    obj.insertColumn(true);
                }
            });
        elColumnActionsDiv.append(elColumnAddLeft);
        let elColumnAddRight = $(`<button id="rbro_menu_column_add_right"
                class="rbroButton rbroActionButton rbroIcon-column-add-right" type="button"
                title="${this.rb.getLabel('menuColumnAddRight')}"></button>`)
            .click(event => {
                let obj = this.rb.getSelectedObject();
                if (obj instanceof TableTextElement) {
                    obj.insertColumn(false);
                }
            });
        elColumnActionsDiv.append(elColumnAddRight);
        let elColumnDelete = $(`<button id="rbro_menu_column_delete"
                class="rbroButton rbroActionButton rbroIcon-column-delete" type="button"
                title="${this.rb.getLabel('menuColumnDelete')}"></button>`)
            .click(event => {
                let obj = this.rb.getSelectedObject();
                if (obj instanceof TableTextElement) {
                    obj.deleteColumn();
                }
            });
        elColumnActionsDiv.append(elColumnDelete);
        elActionsDiv.append(elColumnActionsDiv);

        let elRowActionsDiv = $('<div id="rbro_menu_row_actions" style="display: none;"></div>');
        let elRowAddAbove = $(`<button id="rbro_menu_row_add_above"
                class="rbroButton rbroActionButton rbroIcon-row-add-above" type="button"
                title="${this.rb.getLabel('menuRowAddAbove')}"></button>`)
            .click(event => {
                let obj = this.rb.getSelectedObject();
                if (obj instanceof TableTextElement && obj.getParent() !== null) {
                    obj.getParent().insertRow(true);
                }
            });
        elRowActionsDiv.append(elRowAddAbove);
        let elRowAddBelow = $(`<button id="rbro_menu_row_add_below"
                class="rbroButton rbroActionButton rbroIcon-row-add-below" type="button"
                title="${this.rb.getLabel('menuRowAddBelow')}"></button>`)
            .click(event => {
                let obj = this.rb.getSelectedObject();
                if (obj instanceof TableTextElement && obj.getParent() !== null) {
                    obj.getParent().insertRow(false);
                }
            });
        elRowActionsDiv.append(elRowAddBelow);
        let elRowDelete = $(`<button id="rbro_menu_row_delete"
                class="rbroButton rbroActionButton rbroIcon-row-delete" type="button"
                title="${this.rb.getLabel('menuRowDelete')}"></button>`)
            .click(event => {
                let obj = this.rb.getSelectedObject();
                if (obj instanceof TableTextElement && obj.getParent() !== null) {
                    obj.getParent().deleteRow();
                }
            });
        elRowActionsDiv.append(elRowDelete);
        elActionsDiv.append(elRowActionsDiv);

        let elZoomDiv = $('<div id="rbro_menu_zoom" class="rbroZoom"></div>');
        elZoomDiv.append($('<span id="rbro_menu_zoom_level" class="rbroZoomLevel"></span>'));
        let elMenuZoomIn = $(`<button id="rbro_menu_zoom_in"
                class="rbroButton rbroRoundButton rbroZoomButton rbroIcon-plus
                ${!this.rb.getDocument().isZoomInPossible() ? 'rbroButtonInactive' : ''}" type="button"
                title="${this.rb.getLabel('menuZoomIn')}"></button>`)
            .click(event => {
                this.rb.getDocument().zoomIn();
            });
        elZoomDiv.append(elMenuZoomIn);
        let elMenuZoomOut = $(`<button id="rbro_menu_zoom_out"
                class="rbroButton rbroRoundButton rbroZoomButton rbroIcon-minus
                ${!this.rb.getDocument().isZoomOutPossible() ? 'rbroButtonInactive' : ''}" type="button"
                title="${this.rb.getLabel('menuZoomOut')}"></button>`)
            .click(event => {
                this.rb.getDocument().zoomOut();
            });
        elZoomDiv.append(elMenuZoomOut);
        elActionsDiv.append(elZoomDiv);

        let elMenuToggleGrid = $(`<button id="rbro_menu_toggle_grid"
                class="rbroButton rbroGridButton rbroActionButton rbroIcon-grid ${this.rb.getProperty('showGrid') ? 'rbroButtonActive' : ''}" type="button"
                title="${this.rb.getLabel('menuToggleGrid')}"></button>`)
            .click(event => {
                elMenuToggleGrid.toggleClass('rbroButtonActive');
                this.rb.getDocument().toggleGrid();
            });
        elActionsDiv.append(elMenuToggleGrid);

        panelRight.append(elActionsDiv);
        panel.append(panelRight);
    }

    updateZoomButtons(zoomInPossible, zoomOutPossible) {
        if (zoomInPossible) {
            $('#rbro_menu_zoom_in').removeAttr('disabled');
        } else {
            $('#rbro_menu_zoom_in').attr('disabled', 'disabled');
        }
        if (zoomOutPossible) {
            $('#rbro_menu_zoom_out').removeAttr('disabled');
        } else {
            $('#rbro_menu_zoom_out').attr('disabled', 'disabled');
        }
    }
}

import Style from '../data/Style';
import DocElement from '../elements/DocElement';

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
        let elElementsDiv = $('<div class="rbroElementButtons"></div>');
        elElementsDiv.append($(`<div id="rbro_menu_element_text" class="rbroButton rbroMenuButton" draggable="true"
                title="${this.rb.getLabel('docElementText')}">
                    <span class="rbroIcon-text"></span>
                </div>`)
            .on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');  // without setData dragging does not work in FF
                event.originalEvent.dataTransfer.effectAllowed = 'copy';

                this.rb.startBrowserDrag('docElement', null, DocElement.type.text, '');

                // avoid calling dragstart handler for main div which disables dragging for all other elements
                event.stopPropagation();
            })
        );
        elElementsDiv.append($(`<div id="rbro_menu_element_line" class="rbroButton rbroMenuButton" draggable="true"
                title="${this.rb.getLabel('docElementLine')}">
                    <span class="rbroIcon-line"></span>
                </div>`)
            .on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');
                event.originalEvent.dataTransfer.effectAllowed = 'copy';
                this.rb.startBrowserDrag('docElement', null, DocElement.type.line, '');
                event.stopPropagation();
            })
        );
        elElementsDiv.append($(`<div id="rbro_menu_element_image" class="rbroButton rbroMenuButton" draggable="true"
                title="${this.rb.getLabel('docElementImage')}">
                    <span class="rbroIcon-image"></span>
                </div>`)
            .on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');
                event.originalEvent.dataTransfer.effectAllowed = 'copy';
                this.rb.startBrowserDrag('docElement', null, DocElement.type.image, '');
                event.stopPropagation();
            })
        );
        elElementsDiv.append($(`<div id="rbro_menu_element_bar_code" class="rbroButton rbroMenuButton" draggable="true"
                title="${this.rb.getLabel('docElementBarCode')}">
                    <span class="rbroIcon-barcode"></span>
                </div>`)
            .on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');
                event.originalEvent.dataTransfer.effectAllowed = 'copy';
                this.rb.startBrowserDrag('docElement', null, DocElement.type.barCode, '');
                event.stopPropagation();
            })
        );
        elElementsDiv.append($(`<div id="rbro_menu_element_table" class="rbroButton rbroMenuButton" draggable="true"
                title="${this.rb.getLabel('docElementTable')}">
                    <span class="rbroIcon-table"></span>
                </div>`)
            .on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');
                event.originalEvent.dataTransfer.effectAllowed = 'copy';
                this.rb.startBrowserDrag('docElement', null, DocElement.type.table, '');
                event.stopPropagation();
            })
        );
        elElementsDiv.append($(`<div id="rbro_menu_element_frame" class="rbroButton rbroMenuButton" draggable="true"
                title="${this.rb.getLabel('docElementFrame')}">
                    <span class="rbroIcon-frame"></span>
                </div>`)
            .on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');
                event.originalEvent.dataTransfer.effectAllowed = 'copy';
                this.rb.startBrowserDrag('docElement', null, DocElement.type.frame, '');
                event.stopPropagation();
            })
        );
        elElementsDiv.append($(`<div id="rbro_menu_element_page_break" class="rbroButton rbroMenuButton" draggable="true"
                title="${this.rb.getLabel('docElementPageBreak')}">
                    <span class="rbroIcon-page-break"></span>
                </div>`)
            .on('dragstart', event => {
                event.originalEvent.dataTransfer.setData('text/plain', '');
                event.originalEvent.dataTransfer.effectAllowed = 'copy';
                this.rb.startBrowserDrag('docElement', null, DocElement.type.pageBreak, '');
                event.stopPropagation();
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
}

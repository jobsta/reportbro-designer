import DocElement from './DocElement';
import TextElement from './TextElement';
import AddDeleteDocElementCmd from '../commands/AddDeleteDocElementCmd';
import CommandGroupCmd from '../commands/CommandGroupCmd';
import Band from '../container/Band';
import * as utils from '../utils';

/**
 * Table text doc element. A text element inside a table cell.
 * @class
 */
export default class TableTextElement extends TextElement {
    constructor(id, initialData, rb) {
        super(id, initialData, rb);
        this.columnIndex = initialData.columnIndex;
        this.parentId = initialData.parentId;
        this.tableId = initialData.tableId;
    }

    registerEventHandlers() {
        this.el
            .dblclick(event => {
                if (!this.rb.isSelectedObject(this.id)) {
                    if (this.rb.isSelectedObject(this.tableId)) {
                        this.rb.selectObject(this.id, !event.shiftKey);
                        event.stopPropagation();
                    }
                }
            })
            .mousedown(event => {
                if (!this.rb.isSelectedObject(this.id)) {
                    if (this.rb.isTableElementSelected(this.tableId)) {
                        this.rb.selectObject(this.id, !event.shiftKey);
                        event.stopPropagation();
                    }
                } else {
                    if (event.shiftKey) {
                        this.rb.deselectObject(this.id);
                    }
                    event.stopPropagation();
                }
            });
    }

    getContainerId() {
        let table = this.getTable();
        if (table !== null) {
            return table.getContainerId();
        }
        return null;
    }

    setValue(field, value, elSelector, isShown) {
        super.setValue(field, value, elSelector, isShown);
        if (field === 'width') {
            let tableObj = this.rb.getDataObject(this.tableId);
            if (tableObj !== null) {
                tableObj.updateColumnWidth(this.columnIndex, value, true);
            }
        } else if (field === 'height') {
            this.updateDisplayInternalNotify(0, 0, this.widthVal, this.heightVal, false);
        }
    }

    updateColumnWidth(width) {
        this.width = width;
        this.widthVal = utils.convertInputToNumber(this.width);
        this.updateDisplayInternalNotify(0, 0, this.widthVal, this.heightVal, false);
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        let fields = ['id', 'width', 'height', 'content', 'eval',
            'styleId', 'bold', 'italic', 'underline',
            'horizontalAlignment', 'verticalAlignment', 'textColor', 'backgroundColor', 'font', 'fontSize', 'lineSpacing',
            'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom',
            'removeEmptyElement', 'alwaysPrintOnSamePage', 'pattern', 'link',
            'cs_condition', 'cs_styleId', 'cs_bold', 'cs_italic', 'cs_underline',
            'cs_horizontalAlignment', 'cs_verticalAlignment', 'cs_textColor', 'cs_backgroundColor',
            'cs_font', 'cs_fontSize', 'cs_lineSpacing',
            'cs_paddingLeft', 'cs_paddingTop', 'cs_paddingRight', 'cs_paddingBottom'];
        let tableBandObj = this.rb.getDataObject(this.parentId);
        if (tableBandObj !== null && tableBandObj.getValue('bandType') === Band.bandType.header) {
            fields.push('printIf');
        }
        return fields;
    }

    getElementType() {
        return DocElement.type.tableText;
    }

    updateDisplayInternal(x, y, width, height) {
        this.updateDisplayInternalNotify(x, y, width, height, true);
    }

    updateDisplayInternalNotify(x, y, width, height, notifyTableElement) {
        if (this.el !== null) {
            // set td width to width - 1 because border consumes 1 pixel
            let props = { width: this.rb.toPixel(width - 1) };
            this.el.css(props);
        }
        // update inner text element width
        let contentSize = this.getContentSize(width, height, this.getStyle());
        $(`#rbro_el_content_text${this.id}`).css({ width: this.rb.toPixel(contentSize.width), height: this.rb.toPixel(contentSize.height) });

        if (notifyTableElement) {
            let tableObj = this.rb.getDataObject(this.tableId);
            if (tableObj !== null) {
                let tableBandObj = this.rb.getDataObject(this.parentId);
                tableObj.notifyColumnWidthResized(tableBandObj, this.columnIndex, width);
            }
        }
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return ['E'];
    }

    getXTagId() {
        return '';
    }

    getYTagId() {
        return '';
    }

    getWidthTagId() {
        return 'rbro_text_element_width';
    }

    getHeightTagId() {
        return '';
    }

    hasBorderSettings() {
        return false;
    }

    isDraggingAllowed() {
        return false;
    }

    isDroppingAllowed() {
        return false;
    }

    /**
     * Returns maximum allowed width of element.
     * This is needed when the element is resized by dragging so the resized element does not overflow its container.
     * @returns {Number}.
     */
    getMaxWidth() {
        let tableObj = this.rb.getDataObject(this.tableId);
        let tableBandObj = this.rb.getDataObject(this.parentId);
        if (tableObj !== null && tableBandObj !== null) {
            let contentWidth = this.rb.getDocumentProperties().getContentSize().width;
            let widths = tableBandObj.getColumnWidths();
            let widthOther = 0;  // width of other cells
            for (let i = 0; i < widths.length; i++) {
                if (i !== this.columnIndex) {
                    widthOther += widths[i];
                }
            }
            return contentWidth - widthOther - tableObj.xVal;
        }
        return 0;
    }

    /**
     * Returns x-offset relative to table.
     * @returns {Number}.
     */
    getOffsetX() {
        let tableBandObj = this.rb.getDataObject(this.parentId);
        if (tableBandObj !== null) {
            let widths = tableBandObj.getColumnWidths();
            let offsetX = 0;
            for (let i = 0; i < this.columnIndex; i++) {
                offsetX += widths[i];
            }
            return offsetX;
        }
        return 0;
    }

    createElement() {
        this.el = $(`<td id="rbro_el${this.id}" class="rbroTableTextElement"></td>`)
            .append($(`<div id="rbro_el_content${this.id}" class="rbroContentContainerHelper"></div>`)
                .append($(`<div id="rbro_el_content_text${this.id}" class="rbroDocElementContentText"></div>`)
                    .append($(`<span id="rbro_el_content_text_data${this.id}"></span>`))
            ));
        $(`#rbro_el_table_band${this.parentId}`).append(this.el);
        $(`#rbro_el_content_text_data${this.id}`).text(this.content);
        this.registerEventHandlers();
    }

    getParent() {
        return this.rb.getDataObject(this.parentId);
    }

    getTable() {
        return this.rb.getDataObject(this.tableId);
    }

    /**
     * Adds a table column to the left or right of this cell.
     * @param {Boolean} left - if true then column will be added to the left, otherwise to the right.
     */
    insertColumn(left) {
        let tableBand = this.getParent();
        let table = this.getTable();
        if (tableBand !== null && table !== null) {
            let colIndex = tableBand.getColumnIndex(this);
            if (colIndex !== -1) {
                let cmdGroup = new CommandGroupCmd('Insert column');
                // delete table with current settings and restore below with new columns, necessary for undo/redo
                let cmd = new AddDeleteDocElementCmd(false, table.getPanelItem().getPanelName(),
                    table.toJS(), table.getId(), table.getContainerId(), -1, this.rb);
                cmdGroup.addCommand(cmd);

                // increase column count of table
                let columns = utils.convertInputToNumber(table.getValue('columns')) + 1;
                table.setValue('columns', columns, 'rbro_table_element_columns', false);

                // add a column to each table band
                table.getValue('headerData').createColumns(columns, true, colIndex, left);
                for (let i=0; i < table.getValue('contentDataRows').length; i++) {
                    table.getValue('contentDataRows')[i].createColumns(columns, true, colIndex, left);
                }
                table.getValue('footerData').createColumns(columns, true, colIndex, left);

                // restore table with new column count and updated settings
                cmd = new AddDeleteDocElementCmd(true, table.getPanelItem().getPanelName(),
                    table.toJS(), table.getId(), table.getContainerId(), -1, this.rb);
                cmdGroup.addCommand(cmd);

                this.rb.executeCommand(cmdGroup);
                // select new column
                this.rb.selectObject(
                    this.getParent().getValue('columnData')[left ? colIndex : (colIndex + 1)].getId(), true);
            }
        }
    }

    /**
     * Delete column where this cell belongs to.
     */
    deleteColumn() {
        let tableBand = this.getParent();
        let table = this.getTable();
        if (tableBand !== null && table !== null) {
            let colIndex = tableBand.getColumnIndex(this);
            if (colIndex !== -1) {
                let cmdGroup = new CommandGroupCmd('Delete column');
                // delete table with current settings and restore below with new columns, necessary for undo/redo
                let cmd = new AddDeleteDocElementCmd(false, table.getPanelItem().getPanelName(),
                    table.toJS(), table.getId(), table.getContainerId(), -1, this.rb);
                cmdGroup.addCommand(cmd);

                // decrease column count of table
                let columns = utils.convertInputToNumber(table.getValue('columns')) - 1;
                table.setValue('columns', columns, 'rbro_table_element_columns', false);

                // remove column from each table band
                table.getValue('headerData').deleteColumn(colIndex);
                for (let i=0; i < table.getValue('contentDataRows').length; i++) {
                    table.getValue('contentDataRows')[i].deleteColumn(colIndex);
                }
                table.getValue('footerData').deleteColumn(colIndex);

                // restore table with new column count and updated settings
                cmd = new AddDeleteDocElementCmd(true, table.getPanelItem().getPanelName(),
                    table.toJS(), table.getId(), table.getContainerId(), -1, this.rb);
                cmdGroup.addCommand(cmd);

                this.rb.executeCommand(cmdGroup);
            }
        }
    }
}

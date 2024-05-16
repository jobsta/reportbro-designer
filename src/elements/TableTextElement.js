import DocElement from './DocElement';
import TextElement from './TextElement';
import AddDeleteDocElementCmd from '../commands/AddDeleteDocElementCmd';
import CommandGroupCmd from '../commands/CommandGroupCmd';
import SetValueCmd from '../commands/SetValueCmd';
import Band from '../container/Band';
import * as utils from '../utils';

/**
 * Table text doc element. A text element inside a table cell.
 * @class
 */
export default class TableTextElement extends TextElement {
    constructor(id, initialData, rb) {
        super(id, initialData, rb);
        this.elContent = null;
        this.elContentText = null;
        this.elContentTextData = null;
        this.colspan = initialData.colspan || '';
        this.colspanVal = 1;
        this.columnIndex = initialData.columnIndex;
        this.parentId = initialData.parentId;
        this.tableId = initialData.tableId;
        this.displayWidth = this.widthVal;
        this.lastTouchStartTime = 0;
        this.updateColspanVal();
    }

    setInitialData(initialData) {
        this.growWeight = 0;
        super.setInitialData(initialData);
    }

    registerEventHandlers() {
        this.el.addEventListener('dblclick', (event) => {
            if (!this.rb.isSelectedObject(this.id)) {
                if (this.rb.isSelectedObject(this.tableId)) {
                    this.rb.selectObject(this.id, !event.shiftKey);
                    event.stopPropagation();
                }
            }
        });
        this.el.addEventListener('mousedown', (event) => {
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
        this.el.addEventListener('touchstart', (event) => {
            if (!this.rb.isSelectedObject(this.id)) {
                let timeSinceLastTouch = new Date().getTime() - this.lastTouchStartTime;
                // if last touch event was just recently ("double click") we allow
                // selection of this table text element. Otherwise element can only be
                // selected if another table text is already selected.
                if (timeSinceLastTouch < 1000) {
                    if (this.rb.isSelectedObject(this.tableId)) {
                        this.rb.selectObject(this.id, true);
                        event.stopPropagation();
                    }
                } else {
                    if (this.rb.isTableElementSelected(this.tableId)) {
                        this.rb.selectObject(this.id, true);
                        event.stopPropagation();
                    }
                }
            }
            this.lastTouchStartTime = new Date().getTime();
        });
    }

    getContainerId() {
        let table = this.getTable();
        if (table !== null) {
            return table.getContainerId();
        }
        return null;
    }

    getValue(field) {
        if (field === 'xReadOnly') {
            // offset of this cell relative to table, needed for display in read-only field
            return this.getOffsetX();
        }
        return super.getValue(field);
    }

    setValue(field, value) {
        super.setValue(field, value);

        if (field === 'width') {
            let table = this.getTable();
            if (table !== null) {
                table.updateColumnWidth(this.columnIndex, value);
                table.updateColumnDisplay();
            }
        } else if (field === 'height') {
            this.updateDisplayInternalNotify(0, 0, this.displayWidth, this.heightVal, false);
        } else if (field === 'colspan') {
            this.updateColspanVal();
            let tableObj = this.rb.getDataObject(this.tableId);
            if (tableObj !== null) {
                tableObj.updateColumnDisplay();
            }
        }
    }

    /**
     * Returns value to use for updating input control.
     *
     * Needed for cells with colspan > 1 because internal width is only for 1 cell but
     * displayed width in input field is total width for all cells included in colspan.
     *
     * @param {String} field - field name.
     * @param {String} value - value for update.
     */
    getUpdateValue(field, value) {
        if (field === 'width') {
            let updateValue = utils.convertInputToNumber(value);
            if (this.colspanVal > 1) {
                let tableBandObj = this.rb.getDataObject(this.parentId);
                if (tableBandObj !== null) {
                    let nextCellIndex = this.getNextCellIndex();
                    let cellWidths = tableBandObj.getSingleCellWidths();
                    if (nextCellIndex > cellWidths.length) {
                        nextCellIndex = cellWidths.length;
                    }
                    for (let i = this.columnIndex + 1; i < nextCellIndex; i++) {
                        updateValue += cellWidths[i];
                    }
                }
            }
            if (value === '' && updateValue === 0) {
                // empty input value
                return '';
            }
            return '' + updateValue;
        }
        return value;
    }

    setWidth(width) {
        this.width = width;
        this.widthVal = utils.convertInputToNumber(width);
    }

    getDisplayWidth() {
        return this.displayWidth;
    }

    setDisplayWidth(width) {
        this.displayWidth = width;
    }

    /**
     * Returns display width split into width for all cells contained in colspan.
     * @param {Number} displayWidth - new display width.
     * @returns {Number[]} array of width values for each cell contained in colspan.
     */
    getDisplayWidthSplit(displayWidth) {
        if (this.colspanVal === 1) {
            return [displayWidth];
        }
        let minWidth = 20;
        let rv = [minWidth];
        let width2 = minWidth;
        let tableBandObj = this.rb.getDataObject(this.parentId);
        if (tableBandObj !== null) {
            let nextCellIndex = this.getNextCellIndex();
            let cellWidths = tableBandObj.getSingleCellWidths();
            if (nextCellIndex > cellWidths.length) {
                nextCellIndex = cellWidths.length;
            }
            for (let i = this.columnIndex + 1; i < nextCellIndex; i++) {
                rv.push(cellWidths[i]);
                width2 += cellWidths[i];
            }
            let diff = displayWidth - width2;
            if (diff > 0) {
                rv[0] += diff;
            } else if (diff < 0) {
                let i = 1;
                diff = -diff;
                while (i < rv.length) {
                    if ((rv[i] - minWidth) > diff) {
                        rv[i] -= diff;
                        break;
                    }
                    diff -= rv[i] - minWidth;
                    rv[i] = minWidth;
                    i++;
                }
            }
        }
        return rv;
    }

    updateColspanVal() {
        this.colspanVal = utils.convertInputToNumber(this.colspan);
        if (this.colspanVal <= 0) {
            this.colspanVal = 1;
        }
        if (this.el !== null) {
            this.el.setAttribute('colspan', this.colspanVal);
        }
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        let fields = this.getProperties();
        // remove 'xReadOnly' field and add 'id'
        fields.splice(0, 1, 'id');
        return fields;
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        let fields = [
            'xReadOnly', 'width', 'content', 'richText', 'richTextContent', 'richTextHtml', 'eval', 'colspan',
            'styleId', 'bold', 'italic', 'underline', 'strikethrough',
            'horizontalAlignment', 'verticalAlignment', 'textColor', 'backgroundColor',
            'font', 'fontSize', 'lineSpacing',
            'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom',
            'pattern', 'link', 'cs_condition', 'cs_styleId', 'cs_additionalRules',
            'cs_bold', 'cs_italic', 'cs_underline', 'cs_strikethrough',
            'cs_horizontalAlignment', 'cs_verticalAlignment', 'cs_textColor', 'cs_backgroundColor',
            'cs_font', 'cs_fontSize', 'cs_lineSpacing',
            'cs_paddingLeft', 'cs_paddingTop', 'cs_paddingRight', 'cs_paddingBottom',
            'spreadsheet_type', 'spreadsheet_pattern', 'spreadsheet_textWrap'
        ];
        let tableBandObj = this.rb.getDataObject(this.parentId);
        if (tableBandObj !== null && tableBandObj.getValue('bandType') === Band.bandType.header) {
            fields.push('printIf');
            fields.push('growWeight');
        }
        return fields;
    }

    getElementType() {
        return DocElement.type.tableText;
    }

    updateDisplay() {
        this.updateDisplayInternal(this.xVal, this.yVal, this.displayWidth, this.heightVal);
    }

    updateDisplayInternal(x, y, width, height) {
        this.updateDisplayInternalNotify(x, y, width, height, true);
    }

    updateDisplayInternalNotify(x, y, width, height, notifyTableElement) {
        if (this.el !== null) {
            // set td width to width - 1 because border consumes 1 pixel
            this.el.style.width = this.rb.toPixel(width - 1);
        }
        // update inner text element width
        let contentSize = this.getContentSize(width, height, this.getStyle());
        this.elContentText.style.width = this.rb.toPixel(contentSize.width);
        this.elContentText.style.height = this.rb.toPixel(contentSize.height);

        if (notifyTableElement) {
            let tableObj = this.rb.getDataObject(this.tableId);
            if (tableObj !== null) {
                let tableBandObj = this.rb.getDataObject(this.parentId);
                // calculate table width
                let newTableWidth = width;
                let cellWidths = tableBandObj.getSingleCellWidths();
                for (let i=0; i < cellWidths.length; i++) {
                    if (i < this.columnIndex || i >= (this.columnIndex + this.colspanVal)) {
                        newTableWidth += cellWidths[i];
                    }
                }

                let widths = this.getDisplayWidthSplit(width);
                for (let i = 0; i < widths.length; i++) {
                    tableObj.notifyColumnWidthResized(
                        tableBandObj, this.columnIndex + i, widths[i], newTableWidth);
                }
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

    hasBorderSettings() {
        return false;
    }

    isAreaSelectionAllowed() {
        return false;
    }

    isDraggingAllowed() {
        return false;
    }

    isDroppingAllowed() {
        return false;
    }

    /**
     * Returns minimum allowed width of element.
     * @returns {Number}.
     */
    getMinWidth() {
        return 20 * this.colspanVal;
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
            let widths = tableBandObj.getSingleCellWidths();
            let widthOther = 0;  // width of other cells
            for (let i = 0; i < widths.length; i++) {
                if (i < this.columnIndex || i >= (this.columnIndex + this.colspanVal)) {
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
            let widths = tableBandObj.getSingleCellWidths();
            let offsetX = 0;
            for (let i = 0; i < this.columnIndex; i++) {
                offsetX += widths[i];
            }
            return offsetX;
        }
        return 0;
    }

    getCellIndex() {
        return this.columnIndex;
    }

    /**
     * Returns index of next cell by taking column span into account.
     * @returns {Number}.
     */
    getNextCellIndex() {
        return this.columnIndex + this.colspanVal;
    }

    createElement() {
        this.el = utils.createElement('td', { id: `rbro_el${this.id}`, class: 'rbroTableTextElement' });
        this.elContent = utils.createElement(
            'div', { id: `rbro_el_content${this.id}`, class: 'rbroContentContainerHelper' });
        this.elContentText = utils.createElement(
            'div', { id: `rbro_el_content_text${this.id}`, class: 'rbroDocElementContentText' });
        this.elContentTextData = utils.createElement('span', { id: `rbro_el_content_text_data${this.id}` });
        this.elContentText.append(this.elContentTextData);
        this.elContent.append(this.elContentText);
        this.el.append(this.elContent);

        if (this.colspanVal > 1) {
            this.el.setAttribute('colspan', this.colspanVal);
        }
        document.getElementById(`rbro_el_table_band${this.parentId}`).append(this.el);
        document.getElementById(`rbro_el_content_text_data${this.id}`).textContent = this.content;
        this.registerEventHandlers();
    }

    getParent() {
        return this.rb.getDataObject(this.parentId);
    }

    getTable() {
        return this.rb.getDataObject(this.tableId);
    }

    addCommandsForChangedWidth(newWidth, disableSelect, cmdGroup) {
        let widths = this.getDisplayWidthSplit(newWidth);
        let tableBand = this.getParent();
        if (tableBand !== null) {
            for (let i = widths.length - 1; i >= 0; i--) {
                let cmd = new SetValueCmd(
                    tableBand.getColumn(this.columnIndex + i).getId(),
                    'width', '' + widths[i], SetValueCmd.type.text, this.rb);
                if (disableSelect || i > 0) {
                    cmd.disableSelect();
                }
                cmdGroup.addCommand(cmd);
            }
        }
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
                table.setValue('columns', columns);

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
                table.setValue('columns', columns);

                // subtract column width from table width
                let tableWidth = table.getValue('widthVal');
                table.setValue('width', tableWidth - this.widthVal);

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

    toJS() {
        let rv = super.toJS();
        rv['growWeight'] = utils.convertInputToNumber(rv['growWeight']);
        return rv;
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'TableTextElement';
    }
}

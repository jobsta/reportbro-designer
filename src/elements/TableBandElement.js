import DocElement from './DocElement';
import TableTextElement from './TableTextElement';
import AddDeleteDocElementCmd from '../commands/AddDeleteDocElementCmd';
import CommandGroupCmd from '../commands/CommandGroupCmd';
import Band from '../container/Band';
import MainPanelItem from '../menu/MainPanelItem';
import * as utils from '../utils';

/**
 * Table band doc element. This is the header, content or footer of a table.
 * @class
 */
export default class TableBandElement extends DocElement {
    constructor(id, initialData, bandType, rb) {
        let name = (bandType === 'header') ?
            rb.getLabel('bandHeader') :
            ((bandType === 'footer') ? rb.getLabel('bandFooter') : rb.getLabel('bandContent'));
        super(name, id, 0, 20, rb);
        this.bandType = bandType;
        this.repeatHeader = false;
        this.alwaysPrintOnSamePage = true;
        this.pageBreak = false;
        this.backgroundColor = '';
        this.alternateBackgroundColor = '';
        this.groupExpression = '';
        this.repeatGroupHeader = false;
        this.parentId = initialData.parentId;
        this.columnData = [];

        this.heightVal = 0;

        this.setInitialData(initialData);
    }

    setInitialData(initialData) {
        for (let key in initialData) {
            if (initialData.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                this[key] = initialData[key];
            }
        }
        this.heightVal = utils.convertInputToNumber(this.height);
    }

    setup() {
        this.createElement();
        this.updateStyle();
    }

    registerEventHandlers() {
    }

    /**
     * Returns highest id of this component including all its child components.
     * @returns {Number}
     */
    getMaxId() {
        let maxId = this.id;
        for (let col of this.columnData) {
            if (col.getId() > maxId) {
                maxId = col.getId();
            }
        }
        return maxId;
    }

    getContainerId() {
        let parent = this.getParent();
        if (parent !== null) {
            return parent.getContainerId();
        }
        return null;
    }

    setValue(field, value) {
        this[field] = value;
        if (field === 'height') {
            let height = utils.convertInputToNumber(value);
            this[field + 'Val'] = height;
            const elCells = this.getElement().querySelectorAll('td');
            for (const elCell of elCells) {
                elCell.style.height = this.rb.toPixel(height);
            }
            for (let col of this.columnData) {
                col.setValue(field, value);
            }
            let table = this.getParent();
            if (table !== null) {
                table.updateHeight();
            }
        } else if (field === 'backgroundColor') {
            this.updateStyle();
        }
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        let fields = this.getProperties();
        fields.splice(0, 0, 'id');
        return fields;
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        let fields = ['height', 'styleId', 'backgroundColor'];
        if (this.bandType === Band.bandType.header) {
            fields.push('repeatHeader');
        } else if (this.bandType === Band.bandType.content) {
            fields.push('alternateBackgroundColor');
            fields.push('groupExpression');
            fields.push('printIf');
            fields.push('alwaysPrintOnSamePage');
            fields.push('pageBreak');
            fields.push('repeatGroupHeader');
        }
        return fields;
    }

    updateDisplayInternal(x, y, width, height) {
    }

    updateStyle() {
        this.el.style.backgroundColor = this.backgroundColor;
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return [];
    }

    getHeight() {
        return this.heightVal;
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

    createElement() {
        this.el = utils.createElement('tr', { id: `rbro_el_table_band${this.id}`, class: 'rbroTableBandElement' });
        document.getElementById(`rbro_el_table_${this.bandType}${this.parentId}`).append(this.el);
    }

    remove() {
        for (let i=0; i < this.columnData.length; i++) {
            this.rb.deleteDataObject(this.columnData[i]);
        }

        super.remove();
    }

    getParent() {
        return this.rb.getDataObject(this.parentId);
    }

    /**
     * Create given number of columns for this band.
     * @param {Number} columns - column count, this can be more or less than current number of columns.
     * @param {Boolean} isUpdate - true if this is triggered by a changed value, false if called during initalization.
     * @param {Number} insertColIndex - column index where a new column will be inserted,
     * either left or right to this index.
     * If -1 then no column is inserted at a certain index.
     * @param {Boolean} insertLeft - if true then the new column is inserted left to param insertColIndex,
     * otherwise it is inserted right to it.
     * Only used if param insertColIndex is not -1.
     */
    createColumns(columns, isUpdate, insertColIndex, insertLeft) {
        if (this.panelItem === null) {
            return;
        }

        if (isUpdate) {
            for (let i=0; i < this.columnData.length; i++) {
                this.columnData[i].remove();
                if (i >= columns) {
                    this.rb.deleteDataObject(this.columnData[i]);
                }
            }
        }
        let newColumnData = [];
        for (let i=0; i < columns; i++) {
            let data;
            let dataId;
            let colWidth = isUpdate ? 20 : 100;
            let useColDataIndex = i;
            if (insertColIndex !== -1) {
                if (insertLeft) {
                    if (i === insertColIndex) {
                        colWidth = this.columnData[insertColIndex].getValue('widthVal');
                        useColDataIndex = -1;
                    } else if (i >= insertColIndex) {
                        useColDataIndex--;
                    }
                } else {
                    if (i === (insertColIndex + 1)) {
                        colWidth = this.columnData[insertColIndex].getValue('widthVal');
                        useColDataIndex = -1;
                    } else if (i > insertColIndex) {
                        useColDataIndex--;
                    }
                }
            }
            if (useColDataIndex !== -1 && useColDataIndex < this.columnData.length) {
                data = this.columnData[useColDataIndex];
                data.columnIndex = i;
                dataId = data.id;
                if (!isUpdate) {
                    data.band = this.band;
                    data.parentId = this.id;
                    data.tableId = this.parentId;
                    data.height = this.height;
                }
            } else {
                data = { band: this.band, columnIndex: i, parentId: this.id, tableId: this.parentId,
                        width: colWidth, height: this.height };
            }
            if (!dataId) {
                dataId = this.rb.getUniqueId();
            }

            let textElement = new TableTextElement(dataId, data, this.rb);
            newColumnData.push(textElement);
        	this.rb.addDataObject(textElement);
            let panelItemText = new MainPanelItem(
                DocElement.type.text, this.panelItem, textElement, { showDelete: false }, this.rb);
            textElement.setPanelItem(panelItemText);
            this.panelItem.appendChild(panelItemText);
        }
        this.columnData = newColumnData;
        // call setup of table text elements after columnData of table band has been set
        for (let col of newColumnData) {
            col.setup(true);
        }
        this.updateColumnDisplay();
        const elCells = this.getElement().querySelectorAll('td');
        for (const elCell of elCells) {
            elCell.style.height = this.rb.toPixel(this.heightVal);
        }
    }

    deleteColumn(colIndex) {
        if (colIndex < this.columnData.length) {
            this.columnData[colIndex].remove();
            this.rb.deleteDataObject(this.columnData[colIndex]);
            this.columnData.splice(colIndex, 1);
        }
    }

    show(visible) {
        if (visible) {
            this.el.classList.remove('rbroHidden');
        } else {
            this.el.classList.add('rbroHidden');
        }
    }

    updateColumnWidth(columnIndex, width) {
        let i = 0;
        if (columnIndex < this.columnData.length) {
            this.columnData[columnIndex].setWidth(width);
        }
    }

    /**
     * Update display of columns depending on column span value of preceding columns.
     * e.g. if a column has column span value of 3 then the next two columns will be hidden.
     */
    updateColumnDisplay() {
        let i = 0;
        while (i < this.columnData.length) {
            let colData = this.columnData[i];
            let colWidth = colData.getValue('widthVal');
            let colSpan = colData.getValue('colspanVal');
            colData.getElement().style.display = '';
            if (colSpan > 1) {
                let colspanEndIndex = ((i + colSpan) < this.columnData.length) ? (i + colSpan) : this.columnData.length;
                i++;
                // hide columns within colspan
                while (i < colspanEndIndex) {
                    colWidth += this.columnData[i].getValue('widthVal');
                    this.columnData[i].getElement().style.display = 'none';
                    i++;
                }
            } else {
                i++;
            }
            colData.setDisplayWidth(colWidth);
            colData.updateDisplay();
        }
    }

    getColumn(columnIndex) {
        if (columnIndex >= 0 && columnIndex < this.columnData.length) {
            return this.columnData[columnIndex];
        }
        return null;
    }

    getColumns() {
        return this.columnData;
    }

    /**
     * Is called when column width of a cell was changed to update all DOM elements accordingly.
     * @param {Number} columnIndex - column index of changed cell.
     * @param {Number} newColumnWidth
     */
    notifyColumnWidthResized(columnIndex, newColumnWidth) {
        let i = 0;
        while (i < this.columnData.length) {
            let column = this.columnData[i];
            let nextCellIndex = column.getNextCellIndex();
            if (nextCellIndex > columnIndex) {
                if (nextCellIndex > i + 1) {
                    for (let j = i; j < nextCellIndex && j < this.columnData.length; j++) {
                        if (j !== columnIndex) {
                            newColumnWidth += this.columnData[j].getValue('widthVal');
                        }
                    }
                }
                column.updateDisplayInternalNotify(0, 0, newColumnWidth, column.getValue('heightVal'), false);
                break;
            }
            i = nextCellIndex;
        }
    }

    /**
     * Returns index of given column.
     * @param {DocElement} column - column element to get index for.
     * @returns {Number} Index of column, -1 if column is not contained in this band.
     */
    getColumnIndex(column) {
        for (let i=0; i < this.columnData.length; i++) {
            if (column === this.columnData[i]) {
                return i;
            }
        }
        return -1;
    }

    getWidth() {
        let width = 0;
        let i = 0;
        while (i < this.columnData.length) {
            let col = this.columnData[i];
            width += col.getDisplayWidth();
            let colspan = col.getValue('colspanVal');
            if (colspan > 1) {
                i += colspan;
            } else {
                i++;
            }
        }
        return width;
    }

    /**
     * Returns array of all cell widths of this row.
     * @returns {Number[]} array of cell widths.
     */
    getSingleCellWidths() {
        let widths = [];
        for (let col of this.columnData) {
            widths.push(col.getValue('widthVal'));
        }
        return widths;
    }

    /**
     * Adds a table content row above or below this row.
     * @param {Boolean} above - if true then row will be added above, otherwise below.
     */
    insertRow(above) {
        let table = this.getParent();
        if (table !== null) {
            let rowIndex = table.getContentRowIndex(this);
            if (rowIndex !== -1) {
                let cmdGroup = new CommandGroupCmd('Insert row');
                // delete table with current settings and restore below with new columns, necessary for undo/redo
                let cmd = new AddDeleteDocElementCmd(false, table.getPanelItem().getPanelName(),
                    table.toJS(), table.getId(), table.getContainerId(), -1, this.rb);
                cmdGroup.addCommand(cmd);

                // increase content row count of table
                let contentRows = utils.convertInputToNumber(table.getValue('contentRows')) + 1;
                table.setValue('contentRows', contentRows);

                let contentRow = table.getValue('contentDataRows')[rowIndex];
                let data = { height: contentRow.height, columnData: [] };
                for (let columnData of contentRow.columnData) {
                    data.columnData.push({ width: columnData.width });
                }
                let band = table.createBand('content', -1, data);
                table.getValue('contentDataRows').splice(above ? rowIndex : (rowIndex + 1), 0, band);

                // restore table with new content row count and updated settings
                cmd = new AddDeleteDocElementCmd(true, table.getPanelItem().getPanelName(),
                    table.toJS(), table.getId(), table.getContainerId(), -1, this.rb);
                cmdGroup.addCommand(cmd);

                this.rb.executeCommand(cmdGroup);
                // select first cell of new band
                this.rb.selectObject(band.getValue('columnData')[0].getId(), true);
            }
        }
    }

    /**
     * Delete content row of this band.
     */
    deleteRow() {
        let table = this.getParent();
        if (table !== null) {
            let rowIndex = table.getContentRowIndex(this);
            let contentRows = utils.convertInputToNumber(table.getValue('contentRows'));
            if (rowIndex !== -1 && contentRows > 1) {
                let cmdGroup = new CommandGroupCmd('Delete row');
                // delete table with current settings and restore below with new rows, necessary for undo/redo
                let cmd = new AddDeleteDocElementCmd(false, table.getPanelItem().getPanelName(),
                    table.toJS(), table.getId(), table.getContainerId(), -1, this.rb);
                cmdGroup.addCommand(cmd);

                const tableData = table.toJS();
                // decrease content row count in table data for updated table
                tableData.contentRows = contentRows - 1;
                // remove content row in table data for updated table
                tableData.contentDataRows.splice(rowIndex, 1);

                // restore table with new content row count and updated settings
                cmd = new AddDeleteDocElementCmd(true, table.getPanelItem().getPanelName(),
                    tableData, table.getId(), table.getContainerId(), -1, this.rb);
                cmdGroup.addCommand(cmd);

                this.rb.executeCommand(cmdGroup);
            }
        }
    }

    addChildren(docElements) {
        for (let column of this.columnData) {
            docElements.push(column);
        }
    }

    toJS() {
        const rv = super.toJS();
        rv['columnData'] = [];
        for (const column of this.columnData) {
            rv['columnData'].push(column.toJS());
        }
        return rv;
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'TableBandElement';
    }
}

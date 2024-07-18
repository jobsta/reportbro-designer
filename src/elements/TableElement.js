import DocElement from './DocElement';
import TableBandElement from './TableBandElement';
import AddDeleteDocElementCmd from '../commands/AddDeleteDocElementCmd';
import Parameter from '../data/Parameter';
import MainPanelItem from '../menu/MainPanelItem';
import * as utils from '../utils';

/**
 * Table doc element. Each table cell consists of a text element.
 * @class
 */
export default class TableElement extends DocElement {
    constructor(id, initialData, rb) {
        super(rb.getLabel('docElementTable'), id, 200, 40, rb);
        this.setupComplete = false;
        this.dataSource = '';
        this.borderColor = '#000000';
        this.borderWidth = '1';
        this.border = TableElement.border.grid;
        this.header = true;
        this.footer = false;
        this.contentRows = '1';
        this.columns = '2';
        this.headerData = null;
        this.contentDataRows = [];
        this.footerData = null;
        this.spreadsheet_hide = false;
        this.spreadsheet_column = '';
        this.spreadsheet_addEmptyRow = false;

        this.setInitialData(initialData);

        this.borderWidthVal = utils.convertInputToNumber(this.borderWidth);
    }

    setup(openPanelItem) {
        super.setup(openPanelItem);
        this.createElement();
        this.updateDisplay();

        this.headerData = this.createBand('header', -1, null);
        let contentRows = utils.convertInputToNumber(this.contentRows);
        if (contentRows < 1) {
            contentRows = 1;
        }
        let contentDataRows = [];
        for (let i=0; i < contentRows; i++) {
            contentDataRows.push(this.createBand('content', i, null));
        }
        this.contentDataRows = contentDataRows;
        this.footerData = this.createBand('footer', -1, null);
        this.setupComplete = true;
        this.updateHeight();
        this.updateStyle();
        this.updateName();
        if (openPanelItem) {
            this.panelItem.open();
        }
    }

    createBand(band, index, dataValues) {
        let data;
        let dataKey = band + (band === 'content' ? 'DataRows' : 'Data');
        let dataId;
        let panelItemProperties = { hasChildren: true, showDelete: false };
        if (dataValues) {
            data = dataValues;
        } else if (this[dataKey] && (band !== 'content' || (index !== -1 && index < this[dataKey].length))) {
            if (band === 'content') {
                data = this[dataKey][index];
            } else {
                data = this[dataKey];
            }
            dataId = data.id;
        } else {
            data = {};
        }
        data.parentId = this.id;
        if (!dataId) {
            dataId = this.rb.getUniqueId();
        }
        if ((band === 'header' && !this.header) || (band === 'footer' && !this.footer)) {
            panelItemProperties.visible = false;
        }
        let bandElement = new TableBandElement(dataId, data, band, this.rb);
        this.rb.addDataObject(bandElement);
        let panelItemBand = new MainPanelItem('tableBand', this.panelItem, bandElement, panelItemProperties, this.rb);
        bandElement.setPanelItem(panelItemBand);
        this.panelItem.appendChild(panelItemBand);
        bandElement.setup();
        let columns = utils.convertInputToNumber(this.columns);
        bandElement.createColumns(columns, false, -1, false);
        panelItemBand.open();

        if (band === 'header') {
            bandElement.show(this.header);
        } else if (band === 'footer') {
            bandElement.show(this.footer);
        }
        return bandElement;
    }

    /**
     * Returns highest id of this component including all its child components.
     * @returns {Number}
     */
    getMaxId() {
        let maxId = this.id;
        let tempId;
        tempId = this.headerData.getMaxId();
        if (tempId > maxId) {
            maxId = tempId;
        }
        for (let i=0; i < this.contentDataRows.length; i++) {
            tempId = this.contentDataRows[i].getMaxId();
            if (tempId > maxId) {
                maxId = tempId;
            }
        }
        tempId = this.footerData.getMaxId();
        if (tempId > maxId) {
            maxId = tempId;
        }
        return maxId;
    }

    setValue(field, value) {
        super.setValue(field, value);
        if (field === 'dataSource') {
            this.updateName();
        } else if (field === 'header') {
            this.headerData.show(value);
            if (value) {
                this.headerData.getPanelItem().show();
            } else {
                this.headerData.getPanelItem().hide();
            }
        } else if (field === 'footer') {
            this.footerData.show(value);
            if (value) {
                this.footerData.getPanelItem().show();
            } else {
                this.footerData.getPanelItem().hide();
            }
        } else if (field.indexOf('border') !== -1) {
            if (field === 'borderWidth') {
                this.borderWidthVal = utils.convertInputToNumber(value);
            }
            this.updateStyle();
        }

        if (field === 'header' || field === 'footer' || field === 'contentRows') {
            this.updateHeight();
        }
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            this.el.style.left = this.rb.toPixel(x);
            this.el.style.top = this.rb.toPixel(y);
        }
    }

    updateStyle() {
        let elTable = this.el.querySelector('table');
        let i;
        if (this.border === TableElement.border.grid || this.border === TableElement.border.frameRow ||
                this.border === TableElement.border.frame) {
            elTable.style.borderStyle = 'solid';
            elTable.style.borderWidth = this.borderWidthVal + 'px';
            elTable.style.borderColor = this.borderColor;
        } else {
            elTable.style.borderStyle = 'none';
        }
        let borderStyle = '', borderWidth = '', borderColor = '';
        if (this.border === TableElement.border.grid || this.border === TableElement.border.frameRow ||
                this.border === TableElement.border.row) {
            borderStyle = 'solid none solid none';
            borderWidth = this.borderWidthVal + 'px';
            borderColor = this.borderColor;
        } else {
            borderStyle = 'none';
        }
        const elHeader = this.headerData.getElement();
        elHeader.style.borderStyle = borderStyle;
        elHeader.style.borderWidth = borderWidth;
        elHeader.style.borderColor = borderColor;
        for (i=0; i < this.contentDataRows.length; i++) {
            const elRow = this.contentDataRows[i].getElement();
            elRow.style.borderStyle = borderStyle;
            elRow.style.borderWidth = borderWidth;
            elRow.style.borderColor = borderColor;
        }
        const elFooter = this.footerData.getElement();
        elFooter.style.borderStyle = borderStyle;
        elFooter.style.borderWidth = borderWidth;
        elFooter.style.borderColor = borderColor;

        if (this.border === TableElement.border.grid) {
            borderStyle = 'none solid none solid';
            borderWidth = this.borderWidthVal + 'px';
            borderColor = this.borderColor;
        } else {
            borderStyle = 'none';
        }
        for (const elTd of this.headerData.getElement().querySelectorAll('td')) {
            elTd.style.borderStyle = borderStyle;
            elTd.style.borderWidth = borderWidth;
            elTd.style.borderColor = borderColor;
        }
        for (i=0; i < this.contentDataRows.length; i++) {
            for (const elTd of this.contentDataRows[i].getElement().querySelectorAll('td')) {
                elTd.style.borderStyle = borderStyle;
                elTd.style.borderWidth = borderWidth;
                elTd.style.borderColor = borderColor;
            }
        }
        for (const elTd of this.footerData.getElement().querySelectorAll('td')) {
            elTd.style.borderStyle = borderStyle;
            elTd.style.borderWidth = borderWidth;
            elTd.style.borderColor = borderColor;
        }

        for (const tableClass of [
                'rbroBorderTableGrid', 'rbroBorderTableFrameRow', 'rbroBorderTableFrame',
                'rbroBorderTableRow', 'rbroBorderTableNone']) {
            this.el.classList.remove(tableClass);
        }
        this.el.classList.add('rbroBorderTable' + this.border.charAt(0).toUpperCase() + this.border.slice(1));
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        let fields = this.getProperties();
        fields.splice(0, 0, 'id', 'containerId', 'width');
        return fields;
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        return [
            'x', 'y', 'dataSource', 'columns', 'header', 'contentRows', 'footer',
            'styleId', 'border', 'borderColor', 'borderWidth',
            'printIf', 'removeEmptyElement',
            'spreadsheet_hide', 'spreadsheet_column', 'spreadsheet_addEmptyRow'
        ];
    }

    getElementType() {
        return DocElement.type.table;
    }

    select() {
        super.select();
        let elSizerContainer = this.getSizerContainerElement();
        // create sizers (to indicate selection) which do not support resizing
        for (let sizer of ['NE', 'SE', 'SW', 'NW']) {
            elSizerContainer.append(
                utils.createElement('div', { class: `rbroSizer rbroSizer${sizer} rbroSizerMove` }));
        }
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return [];
    }

    isDroppingAllowed() {
        return false;
    }

    createElement() {
        this.el = utils.createElement('div', { class: 'rbroDocElement rbroTableElement' });
        const elTable = utils.createElement('table', { id: `rbro_el_table${this.id}` });
        elTable.append(utils.createElement('thead', { id: `rbro_el_table_header${this.id}` }));
        elTable.append(utils.createElement('tbody', { id: `rbro_el_table_content${this.id}` }));
        elTable.append(utils.createElement('tfoot', { id: `rbro_el_table_footer${this.id}` }));
        this.el.append(elTable);
        this.appendToContainer();
        this.registerEventHandlers();
        elTable.style.width = (this.widthVal + 1) + 'px';
    }

    remove() {
        this.rb.deleteDataObject(this.headerData);
        this.headerData.remove();
        this.headerData = null;
        for (let i=0; i < this.contentDataRows.length; i++) {
            this.rb.deleteDataObject(this.contentDataRows[i]);
            this.contentDataRows[i].remove();
        }
        this.contentDataRows = [];
        this.rb.deleteDataObject(this.footerData);
        this.footerData.remove();
        this.footerData = null;

        super.remove();
    }

    /**
     * Is called when number of columns was changed to update the column width of all table bands.
     * @param {Number} columnIndex - index of changed column.
     * @param {Number} width - new column width.
     */
    updateColumnWidth(columnIndex, width) {
        if (this.setupComplete) {
            this.headerData.updateColumnWidth(columnIndex, width);
            for (let i=0; i < this.contentDataRows.length; i++) {
                this.contentDataRows[i].updateColumnWidth(columnIndex, width);
            }
            this.footerData.updateColumnWidth(columnIndex, width);
        }
    }

    /**
     * Update display of columns of all bands depending on column span value of preceding columns.
     * e.g. if a column has column span value of 3 then the next two columns will be hidden.
     */
    updateColumnDisplay() {
        if (this.setupComplete) {
            this.headerData.updateColumnDisplay();
            for (let i=0; i < this.contentDataRows.length; i++) {
                this.contentDataRows[i].updateColumnDisplay();
            }
            this.footerData.updateColumnDisplay();
        }
    }

    /**
     * Update table height based on height of available bands.
     */
    updateHeight() {
        if (this.setupComplete) {
            let height = 0;
            if (this.header) {
                height += this.headerData.getHeight();
            }
            for (let i=0; i < this.contentDataRows.length; i++) {
                height += this.contentDataRows[i].getHeight();
            }
            if (this.footer) {
                height += this.footerData.getHeight();
            }
            this.height = '' + height;
            this.heightVal = height;
        }
    }

    /**
     * Is called when column width of a cell was changed to update all DOM elements accordingly.
     * @param {TableBandElement} tableBand - band containing the changed cell.
     * @param {Number} columnIndex - column index of changed cell.
     * @param {Number} newColumnWidth
     * @param {Number} newTableWidth
     */
    notifyColumnWidthResized(tableBand, columnIndex, newColumnWidth, newTableWidth) {
        if (!this.setupComplete)
            return;

        if (tableBand !== this.headerData) {
            this.headerData.notifyColumnWidthResized(columnIndex, newColumnWidth);
        }
        for (let i=0; i < this.contentDataRows.length; i++) {
            if (tableBand !== this.contentDataRows[i]) {
                this.contentDataRows[i].notifyColumnWidthResized(columnIndex, newColumnWidth);
            }
        }
        if (tableBand !== this.footerData) {
            this.footerData.notifyColumnWidthResized(columnIndex, newColumnWidth);
        }
        this.width = '' + newTableWidth;
        this.widthVal = newTableWidth;
        document.getElementById(`rbro_el_table${this.id}`).style.width = (newTableWidth + 1) + 'px';
    }

    updateName() {
        this.name = this.rb.getLabel('docElementTable');
        if (this.dataSource.trim() !== '') {
            this.name += ' ' + this.dataSource;
        }
        document.getElementById(`rbro_menu_item_name${this.id}`).textContent = this.name;
    }

    hasDataSource() {
        return true;
    }

    /**
     * Returns index of given content row.
     * @param {DocElement} row - row element to get index for.
     * @returns {Number} Index of row, -1 if row is not a content row in this table.
     */
    getContentRowIndex(row) {
        for (let i=0; i < this.contentDataRows.length; i++) {
            if (row === this.contentDataRows[i]) {
                return i;
            }
        }
        return -1;
    }

    addChildren(docElements) {
        let i;
        docElements.push(this.headerData);
        for (i=0; i < this.contentDataRows.length; i++) {
            docElements.push(this.contentDataRows[i]);
        }
        docElements.push(this.footerData);
        this.headerData.addChildren(docElements);
        for (i=0; i < this.contentDataRows.length; i++) {
            this.contentDataRows[i].addChildren(docElements);
        }
        this.footerData.addChildren(docElements);
    }

    /**
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {Parameter} parameter - parameter which will be renamed.
     * @param {String} newParameterName - new name of the parameter.
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameterName(parameter, newParameterName, cmdGroup) {
        this.addCommandForChangedParameterName(parameter, newParameterName, 'dataSource', cmdGroup);
    }

    /**
     * Reduce space of existing columns so there is enough space for new columns.
     * @param {Number} columns - new column count.
     * @param {Number} colIndex - columns left of this index will be shrinked (if necessary).
     */
    createSpaceForNewColumns(columns, colIndex) {
        let columnMinWidth = TableElement.getColumnMinWidth();
        let spaceNeeded = columns * columnMinWidth;
        let i = colIndex - 1;
        // reduce width of all existing columns until there is enough space
        while (i >= 0) {
            let column = this.headerData.getColumn(i);
            let freeSpace = column.getValue('widthVal') - columnMinWidth;
            let newWidth = columnMinWidth;
            if (freeSpace > spaceNeeded) {
                newWidth = column.getValue('widthVal') - spaceNeeded;
            }
            this.updateColumnWidth(i, newWidth);
            spaceNeeded -= freeSpace;
            if (spaceNeeded <= 0)
                break;
            i--;
        }
    }

    /**
     * Returns true if there is enough space for the given column count, false otherwise.
     * @param {Number} columns - column count to test for available space.
     * @returns {Boolean}
     */
    hasEnoughAvailableSpace(columns) {
        let existingColumns = utils.convertInputToNumber(this.columns);
        let maxColumns = Math.floor(this.widthVal / TableElement.getColumnMinWidth());
        if (columns > existingColumns && columns > maxColumns) {
            // not enough space for all columns
            return false;
        }
        return true;
    }
    /**
     * Adds commands to command group parameter to recreate table with new column count.
     *
     * The commands are only added if there is enough space available for the new columns.
     * This should be checked beforehand by calling hasEnoughAvailableSpace.
     *
     * @param {Number} columns - requested new column count.
     * @param {CommandGroupCmd} cmdGroup - possible commands will be added to this command group.
     */
    addCommandsForChangedColumns(columns, cmdGroup) {
        if (!this.hasEnoughAvailableSpace(columns)) {
            return;
        }

        let existingColumns = utils.convertInputToNumber(this.columns);

        // delete table with current settings and restore below with new columns, necessary for undo/redo
        let cmd = new AddDeleteDocElementCmd(
            false, this.getPanelItem().getPanelName(),
            this.toJS(), this.id, this.getContainerId(), -1, this.rb);
        cmdGroup.addCommand(cmd);

        if (columns > existingColumns) {
            this.createSpaceForNewColumns(columns - existingColumns, existingColumns);
        } else if (columns < existingColumns) {
            let usedWidth = 0;
            for (let i=0; i < columns; i++) {
                usedWidth += this.headerData.getColumn(i).getValue('widthVal');
            }
            // add remaining space to last column
            let column = this.headerData.getColumn(columns - 1);
            if (this.widthVal - usedWidth > 0) {
                this.updateColumnWidth(columns - 1, column.getValue('widthVal') + (this.widthVal - usedWidth));
            }
        }

        this.columns = columns;
        this.headerData.createColumns(columns, true, -1, false);
        for (let i=0; i < this.contentDataRows.length; i++) {
            this.contentDataRows[i].createColumns(columns, true, -1, false);
        }
        this.footerData.createColumns(columns, true, -1, false);

        // restore table with new column count and updated settings
        cmd = new AddDeleteDocElementCmd(true, this.getPanelItem().getPanelName(),
            this.toJS(), this.id, this.getContainerId(), -1, this.rb);
        cmdGroup.addCommand(cmd);
    }

    /**
     * Adds commands to command group parameter to recreate table with new content rows.
     * @param {Number} contentRows - new content rows count.
     * @param {CommandGroupCmd} cmdGroup - possible commands will be added to this command group.
     */
    addCommandsForChangedContentRows(contentRows, cmdGroup) {
        if (contentRows === utils.convertInputToNumber(this.contentRows)) {
            return;
        }
        // delete table with current settings and restore below with new columns, necessary for undo/redo
        let cmd = new AddDeleteDocElementCmd(
            false, this.getPanelItem().getPanelName(),
            this.toJS(), this.id, this.getContainerId(), -1, this.rb);
        cmdGroup.addCommand(cmd);

        let i;
        if (contentRows < this.contentDataRows.length) {
            for (i = contentRows; i < this.contentDataRows.length; i++) {
                this.rb.deleteDataObject(this.contentDataRows[i]);
                this.contentDataRows[i].remove();
            }
            this.contentDataRows.splice(contentRows, this.contentDataRows.length - contentRows);
        } else {
            let data;
            if (this.contentDataRows.length > 0) {
                data = { height: this.contentDataRows[this.contentDataRows.length - 1].height, columnData: [] };
                for (let columnData of this.contentDataRows[0].columnData) {
                    data.columnData.push({ width: columnData.width });
                }
            }
            for (i = this.contentDataRows.length; i < contentRows; i++) {
                this.contentDataRows.push(this.createBand('content', i, data));
            }
        }

        this.contentRows = '' + contentRows;
        // restore table with new content rows and updated settings
        cmd = new AddDeleteDocElementCmd(
            true, this.getPanelItem().getPanelName(),
            this.toJS(), this.id, this.getContainerId(), -1, this.rb);
        cmdGroup.addCommand(cmd);
    }

    toJS() {
        const rv = super.toJS();
        rv['headerData'] = this.headerData.toJS();
        const contentDataRows = [];
        for (let i=0; i < this.contentDataRows.length; i++) {
            contentDataRows.push(this.contentDataRows[i].toJS());
        }
        rv['contentDataRows'] = contentDataRows;
        rv['footerData'] = this.footerData.toJS();
        return rv;
    }

    static removeIds(data) {
        for (let bandKey of ['headerData', 'footerData']) {
            TableElement.removeBandIds(data[bandKey]);
        }
        for (let i=0; i < data.contentDataRows.length; i++) {
            TableElement.removeBandIds(data.contentDataRows[i]);
        }
    }

    static removeBandIds(bandData) {
        delete bandData.id;
        let columns = bandData.columnData;
        for (let column of columns) {
            delete column.id;
        }
    }

    static getColumnMinWidth() {
        return 20;
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'TableElement';
    }
}

TableElement.border = {
    grid: 'grid',
    frameRow: 'frame_row',
    frame: 'frame',
    row: 'row',
    none: 'none'
};

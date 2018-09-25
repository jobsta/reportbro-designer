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
        this.updateWidth();
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
        } else if (this[dataKey] && (band !== 'content' || index < this[dataKey].length)) {
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
        let panelItemBand = new MainPanelItem('table_band', this.panelItem, bandElement, panelItemProperties, this.rb);
        bandElement.setPanelItem(panelItemBand);
        this.panelItem.appendChild(panelItemBand);
        bandElement.setup();
        let columns = utils.convertInputToNumber(this.columns);
        bandElement.createColumns(columns, false);
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

    setValue(field, value, elSelector, isShown) {
        super.setValue(field, value, elSelector, isShown);
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
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            let props = { left: this.rb.toPixel(x), top: this.rb.toPixel(y) };
            this.el.css(props);
        }
    }

    updateStyle() {
        let elTable = this.el.find('table');
        let i;
        if (this.border === TableElement.border.grid || this.border === TableElement.border.frameRow ||
                this.border === TableElement.border.frame) {
            elTable.css({
                'border-style': 'solid',
                'border-width': this.borderWidthVal + 'px',
                'border-color': this.borderColor
            });
        } else {
            elTable.css({ 'border-style': 'none' });
        }
        let styleProperties;
        if (this.border === TableElement.border.grid || this.border === TableElement.border.frameRow ||
                this.border === TableElement.border.row) {
            styleProperties = {
                'border-style': 'solid none solid none',
                'border-width': this.borderWidthVal + 'px',
                'border-color': this.borderColor
            };
        } else {
            styleProperties = { 'border-style': 'none' };
        }
        this.headerData.getElement().css(styleProperties);
        for (i=0; i < this.contentDataRows.length; i++) {
            this.contentDataRows[i].getElement().css(styleProperties);
        }
        this.footerData.getElement().css(styleProperties);

        if (this.border === TableElement.border.grid) {
            styleProperties = {
                'border-style': 'none solid none solid',
                'border-width': this.borderWidthVal + 'px',
                'border-color': this.borderColor
            };
        } else {
            styleProperties = { 'border-style': 'none' };
        }
        this.headerData.getElement().find('td').css(styleProperties);
        for (i=0; i < this.contentDataRows.length; i++) {
            this.contentDataRows[i].getElement().find('td').css(styleProperties);
        }
        this.footerData.getElement().find('td').css(styleProperties);

        this.el.removeClass('rbroBorderTableGrid rbroBorderTableFrameRow rbroBorderTableFrame rbroBorderTableRow rbroBorderTableNone');
        this.el.addClass('rbroBorderTable' + this.border.charAt(0).toUpperCase() + this.border.slice(1));
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        return ['id', 'containerId', 'x', 'y', 'dataSource', 'columns', 'header', 'contentRows', 'footer',
            'border', 'borderColor', 'borderWidth',
            'spreadsheet_hide', 'spreadsheet_column', 'spreadsheet_addEmptyRow'];
    }

    getElementType() {
        return DocElement.type.table;
    }

    select() {
        super.select();
        let elSizerContainer = this.getSizerContainerElement();
        for (let sizer of ['NE', 'SE', 'SW', 'NW']) {
            elSizerContainer.append($(`<div class="rbroSizer rbroSizer${sizer} rbroSizerInactive"></div>`));
        }
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return [];
    }

    getXTagId() {
        return 'rbro_table_element_position_x';
    }

    getYTagId() {
        return 'rbro_table_element_position_y';
    }

    getWidthTagId() {
        return 'rbro_table_element_width';
    }

    getHeightTagId() {
        return 'rbro_table_element_height';
    }

    isDroppingAllowed() {
        return false;
    }

    createElement() {
        this.el = $(`<div class="rbroDocElement rbroTableElement">
                <table id="rbro_el_table${this.id}">
                    <thead id="rbro_el_table_header${this.id}">
                    </thead>
                    <tbody id="rbro_el_table_content${this.id}">
                    </tbody>
                    <tfoot id="rbro_el_table_footer${this.id}">
                    </tfoot>
                </table>
            </div>`);
        this.appendToContainer();
        this.registerEventHandlers();
    }

    remove() {
        super.remove();
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
    }

    /**
     * Is called when column width of a single column was changed to update the column width of all table bands.
     * @param {Number} columnIndex - index of changed column.
     * @param {Number} width - new column width.
     * @param {Boolean} updateTableWidth - if true the table width will be updated as well.
     */
    updateColumnWidth(columnIndex, width, updateTableWidth) {
        if (this.setupComplete) {
            this.headerData.updateColumnWidth(columnIndex, width);
            for (let i=0; i < this.contentDataRows.length; i++) {
                this.contentDataRows[i].updateColumnWidth(columnIndex, width);
            }
            this.footerData.updateColumnWidth(columnIndex, width);
            if (updateTableWidth) {
                this.updateWidth();
            }
        }
    }

    /**
     * Update table width based on width of all cells of content band.
     */
    updateWidth() {
        if (this.setupComplete) {
            let width = this.headerData.getWidth();
            this.width = '' + width;
            this.widthVal = width;
            $(`#rbro_el_table${this.id}`).css('width', (this.widthVal + 1) + 'px');
        }
    }

    /**
     * Is called when column width of a cell was changed to update all DOM elements accordingly.
     * @param {TableBandElement} tableBand - band containing the changed cell.
     * @param {Number} columnIndex - column index of changed cell.
     * @param {Number} newColumnWidth
     */
    notifyColumnWidthResized(tableBand, columnIndex, newColumnWidth) {
        if (!this.setupComplete)
            return;

        if (tableBand !== this.headerData) {
            let column = this.headerData.getColumn(columnIndex);
            if (column !== null) {
                column.updateDisplayInternalNotify(0, 0, newColumnWidth, column.getValue('heightVal'), false);
            }
        }
        for (let i=0; i < this.contentDataRows.length; i++) {
            if (tableBand !== this.contentDataRows[i]) {
                let column = this.contentDataRows[i].getColumn(columnIndex);
                if (column !== null) {
                    column.updateDisplayInternalNotify(0, 0, newColumnWidth, column.getValue('heightVal'), false);
                }
            }
        }
        if (tableBand !== this.footerData) {
            let column = this.footerData.getColumn(columnIndex);
            if (column !== null) {
                column.updateDisplayInternalNotify(0, 0, newColumnWidth, column.getValue('heightVal'), false);
            }
        }
        let width = this.headerData.getWidth();
        let column = this.headerData.getColumn(columnIndex);
        if (column !== null) {
            width -= column.getValue('widthVal') - newColumnWidth;
        }
        $(`#rbro_el_table${this.id}`).css('width', (width + 1) + 'px');
    }

    updateName() {
        this.name = this.rb.getLabel('docElementTable');
        if (this.dataSource.trim() !== '') {
            this.name += ' ' + this.dataSource;
        }
        $(`#rbro_menu_item_name${this.id}`).text(this.name);
    }

    /**
     * Returns all parameters of the data source (which must be an array parameter).
     * @returns {[Object]} contains the data source name and all parameters of the data source.
     */
    getDataSource() {
        let parameters = [];
        let dataSource = this.dataSource.trim();
        let dataSourceParameter = '';
        if (dataSource.length >= 3 && dataSource.substr(0, 2) === '${' &&
                dataSource.charAt(dataSource.length - 1) === '}') {
            dataSourceParameter = dataSource.substring(2, dataSource.length - 1);
            let param = this.rb.getParameterByName(dataSourceParameter);
            if (param !== null && param.getValue('type') === Parameter.type.array) {
                parameters = param.getChildren();
            }
        }
        return { name: dataSourceParameter, parameters: parameters };
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
        this.addCommandForChangedParameterName(parameter, newParameterName, 'rbro_table_element_data_source', 'dataSource', cmdGroup);
    }

    /**
     * Adds commands to command group parameter to recreate table with new column count.
     * @param {Number} columns - requested new column count.
     * @param {CommandGroupCmd} cmdGroup - possible commands will be added to this command group.
     * @returns {Number} either new column count or existing column count in case there is not enough space
     * for all column.
     */
    addCommandsForChangedColumns(columns, cmdGroup) {
        const COLUMN_MIN_WIDTH = 20;
        let existingColumns = utils.convertInputToNumber(this.columns);
        let maxColumns = Math.floor(this.widthVal / COLUMN_MIN_WIDTH);
        if (columns > existingColumns && columns > maxColumns) {
            // not enough space for all columns
            return existingColumns;
        }

        // delete table with current settings and restore below with new columns, necessary for undo/redo
        let cmd = new AddDeleteDocElementCmd(false, this.getPanelItem().getPanelName(),
            this.toJS(), this.id, this.getContainerId(), -1, this.rb);
        cmdGroup.addCommand(cmd);

        if (columns > existingColumns) {
            let newColumns = columns - existingColumns;
            let spaceNeeded = newColumns * COLUMN_MIN_WIDTH;
            // reduce width of all existing columns until there is enough space
            let i = existingColumns - 1;
            while (i >= 0) {
                let column = this.headerData.getColumn(i);
                let freeSpace = column.getValue('widthVal') - COLUMN_MIN_WIDTH;
                let newWidth = COLUMN_MIN_WIDTH;
                if (freeSpace > spaceNeeded) {
                    newWidth = column.getValue('widthVal') - spaceNeeded;
                }
                this.updateColumnWidth(i, newWidth, false);
                spaceNeeded -= freeSpace;
                if (spaceNeeded <= 0)
                    break;
                i--;
            }
        } else if (columns < existingColumns) {
            let usedWidth = 0;
            for (let i=0; i < columns; i++) {
                usedWidth += this.headerData.getColumn(i).getValue('widthVal');
            }
            // add remaining space to last column
            let column = this.headerData.getColumn(columns - 1);
            if (this.widthVal - usedWidth > 0) {
                this.updateColumnWidth(columns - 1, column.getValue('widthVal') + (this.widthVal - usedWidth), false);
            }
        }

        this.columns = columns;
        this.headerData.createColumns(columns, true);
        for (let i=0; i < this.contentDataRows.length; i++) {
            this.contentDataRows[i].createColumns(columns, true);
        }
        this.footerData.createColumns(columns, true);

        // restore table with new column count and updated settings
        cmd = new AddDeleteDocElementCmd(true, this.getPanelItem().getPanelName(),
            this.toJS(), this.id, this.getContainerId(), -1, this.rb);
        cmdGroup.addCommand(cmd);
        
        return columns;
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
        let cmd = new AddDeleteDocElementCmd(false, this.getPanelItem().getPanelName(),
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
                data = { height: this.contentDataRows[0].height, columnData: [] };
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
        cmd = new AddDeleteDocElementCmd(true, this.getPanelItem().getPanelName(),
            this.toJS(), this.id, this.getContainerId(), -1, this.rb);
        cmdGroup.addCommand(cmd);
    }

    toJS() {
        let ret = super.toJS();
        ret['headerData'] = this.headerData.toJS();
        let contentDataRows = [];
        for (let i=0; i < this.contentDataRows.length; i++) {
            contentDataRows.push(this.contentDataRows[i].toJS());
        }
        ret['contentDataRows'] = contentDataRows;
        ret['footerData'] = this.footerData.toJS();
        return ret;
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
}

TableElement.border = {
    grid: 'grid',
    frameRow: 'frame_row',
    frame: 'frame',
    row: 'row',
    none: 'none'
};

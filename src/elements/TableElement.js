import DocElement from './DocElement';
import TableBandElement from './TableBandElement';
import AddDeleteDocElementCmd from '../commands/AddDeleteDocElementCmd';
import SetValueCmd from '../commands/SetValueCmd';
import MainPanelItem from '../menu/MainPanelItem';
import * as utils from '../utils';

export default class TableElement extends DocElement {
    constructor(id, initialData, rb) {
        super(rb.getLabel('docElementTable'), id, 200, 40, rb);
        this.setupComplete = false;
        this.dataSource = '';
        this.borderColor = '#000000';
        this.border = TableElement.border.grid;
        this.header = true;
        this.footer = false;
        this.columns = '2';
        this.elTable = null;
        this.headerData = null;
        this.contentData = null;
        this.footerData = null;
        this.spreadsheet_hide = false;
        this.spreadsheet_column = '';
        this.spreadsheet_addEmptyRow = false;
        this.setInitialData(initialData);
    }

    setup() {
        super.setup();
        this.createElement();
        this.updateDisplay();
        
        for (let band of ['header', 'content', 'footer']) {
            let data;
            let dataKey = band + 'Data';
            let dataId;
            let panelItemProperties = { hasChildren: true, showDelete: false };
            let hasData = false;
            if (this[dataKey]) {
                data = this[dataKey];
                dataId = data.id;
                hasData = true;
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
            let panelItemBand = new MainPanelItem('table_band', 'tableBandElement', '',
                this.panelItem, bandElement, panelItemProperties, this.rb);
            bandElement.setPanelItem(panelItemBand);
            this.panelItem.appendChild(panelItemBand);
            bandElement.setup();
            let columns = utils.convertInputToNumber(this.columns);
            bandElement.createColumns(columns, false);

            if (band === 'header') {
                this.headerData = bandElement;
                bandElement.show(this.header);
            } else if (band === 'content') {
                this.contentData = bandElement;
            } else if (band === 'footer') {
                this.footerData = bandElement;
                bandElement.show(this.footer);
            }
        }
        this.setupComplete = true;
        this.updateWidth();
        this.updateStyle();
        this.updateDataSource(this.dataSource);
        this.panelItem.open();
    }

    getMaxId() {
        let maxId = this.id;
        let tempId;
        tempId = this.headerData.getMaxId();
        if (tempId > maxId) {
            maxId = tempId;
        }
        tempId = this.contentData.getMaxId();
        if (tempId > maxId) {
            maxId = tempId;
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
            this.updateDataSource(value);
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
        if (this.border === TableElement.border.grid || this.border === TableElement.border.frameRow ||
                this.border === TableElement.border.frame) {
            elTable.css({ 'border-style': 'solid', 'border-width': '1px', 'border-color': this.borderColor });
        } else {
            elTable.css({ 'border-style': 'none' });
        }
        let styleProperties;
        if (this.border === TableElement.border.grid || this.border === TableElement.border.frameRow ||
                this.border === TableElement.border.row) {
            styleProperties = { 'border-style': 'solid none solid none',
                'border-width': '1px', 'border-color': this.borderColor };
        } else {
            styleProperties = { 'border-style': 'none' };
        }
        this.headerData.getElement().css(styleProperties);
        this.contentData.getElement().css(styleProperties);
        this.footerData.getElement().css(styleProperties);

        if (this.border === TableElement.border.grid) {
            styleProperties = { 'border-style': 'none solid none solid',
                'border-width': '1px', 'border-color': this.borderColor };
        } else {
            styleProperties = { 'border-style': 'none' };
        }
        this.headerData.getElement().find('td').css(styleProperties);
        this.contentData.getElement().find('td').css(styleProperties);
        this.footerData.getElement().find('td').css(styleProperties);

        this.el.removeClass('rbroBorderTableGrid rbroBorderTableFrameRow rbroBorderTableFrame rbroBorderTableRow rbroBorderTableNone');
        this.el.addClass('rbroBorderTable' + this.border.charAt(0).toUpperCase() + this.border.slice(1));
    }

    getFields() {
        return ['id', 'containerId', 'x', 'y', 'dataSource', 'columns', 'header', 'footer',
            'border', 'borderColor', 'spreadsheet_hide', 'spreadsheet_column', 'spreadsheet_addEmptyRow'];
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
        this.elTable = null;
        super.remove();
        this.rb.deleteDataObject(this.headerData);
        this.headerData.remove();
        this.headerData = null;
        this.rb.deleteDataObject(this.contentData);
        this.contentData.remove();
        this.contentData = null;
        this.rb.deleteDataObject(this.footerData);
        this.footerData.remove();
        this.footerData = null;
    }

    updateColumnWidth(columnIndex, width, updateTableWidth) {
        if (this.setupComplete) {
            this.headerData.updateColumnWidth(columnIndex, width);
            this.contentData.updateColumnWidth(columnIndex, width);
            this.footerData.updateColumnWidth(columnIndex, width);
            if (updateTableWidth) {
                this.updateWidth();
            }
        }
    }

    updateWidth() {
        if (this.setupComplete) {
            let width = this.contentData.getWidth();
            this.width = '' + width;
            this.widthVal = width;
            $(`#rbro_el_table${this.id}`).css('width', (this.widthVal + 1) + 'px');
        }
    }

    notifyColumnWidthResized(tableBand, columnIndex, newColumnWidth) {
        if (!this.setupComplete)
            return;

        if (tableBand !== this.headerData) {
            let column = this.headerData.getColumn(columnIndex);
            if (column !== null) {
                column.updateDisplayInternalNotify(0, 0, newColumnWidth, 0, false);
            }
        }
        if (tableBand !== this.contentData) {
            let column = this.contentData.getColumn(columnIndex);
            if (column !== null) {
                column.updateDisplayInternalNotify(0, 0, newColumnWidth, 0, false);
            }
        }
        if (tableBand !== this.footerData) {
            let column = this.footerData.getColumn(columnIndex);
            if (column !== null) {
                column.updateDisplayInternalNotify(0, 0, newColumnWidth, 0, false);
            }
        }
        let width = this.contentData.getWidth();
        let column = this.contentData.getColumn(columnIndex);
        if (column !== null) {
            width -= column.getValue('widthVal') - newColumnWidth;
        }
        $(`#rbro_el_table${this.id}`).css('width', (width + 1) + 'px');
    }

    updateDataSource(value) {
        if (value.trim() === '') {
            this.name = this.rb.getLabel('docElementTable');
        } else {
            this.name = this.rb.getLabel('docElementTable') + ' ' + value;
        }
        $(`#rbro_menu_item_name${this.id}`).text(this.name);
    }

    getDataParameters() {
        let parameters = [];
        let dataSource = this.dataSource.trim();
        if (dataSource.length >= 3 && dataSource.substr(0, 2) === '${' &&
                dataSource.charAt(dataSource.length - 1) === '}') {
            let dataSourceParameter = dataSource.substring(2, dataSource.length - 1);
            let param = this.rb.getParameterByName(dataSourceParameter);
            if (param !== null) {
                parameters = param.getChildren();
            }
        }
        return parameters;
    }

    addChildren(docElements) {
        docElements.push(this.headerData);
        docElements.push(this.contentData);
        docElements.push(this.footerData);
        this.headerData.addChildren(docElements);
        this.contentData.addChildren(docElements);
        this.footerData.addChildren(docElements);
    }

    addCommandsForChangedParameter(oldParameterName, newParameterName, cmdGroup) {
        if (this.dataSource.indexOf(oldParameterName) !== -1) {
            let cmd = new SetValueCmd(this.id, 'rbro_table_element_data_source', 'dataSource',
                utils.replaceAll(this.dataSource, oldParameterName, newParameterName), SetValueCmd.type.text, this.rb);
            cmdGroup.addCommand(cmd);
        }
    }

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
                let column = this.contentData.getColumn(i);
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
                usedWidth += this.contentData.getColumn(i).getValue('widthVal');
            }
            // add remaining space to last column
            let column = this.contentData.getColumn(columns - 1);
            if (this.widthVal - usedWidth > 0) {
                this.updateColumnWidth(columns - 1, column.getValue('widthVal') + (this.widthVal - usedWidth), false);
            }
        }

        this.columns = columns;
        this.headerData.createColumns(columns, true);
        this.contentData.createColumns(columns, true);
        this.footerData.createColumns(columns, true);

        // restore table with new column count and updated settings
        cmd = new AddDeleteDocElementCmd(true, this.getPanelItem().getPanelName(),
            this.toJS(), this.id, this.getContainerId(), -1, this.rb);
        cmdGroup.addCommand(cmd);
        
        return columns;
    }

    toJS() {
        let ret = super.toJS();
        ret['headerData'] = this.headerData.toJS();
        ret['contentData'] = this.contentData.toJS();
        ret['footerData'] = this.footerData.toJS();
        return ret;
    }

    static removeIds(data) {
        for (let band of ['header', 'content', 'footer']) {
            let bandKey = band + 'Data';
            delete data[bandKey].id;
            let columns = data[bandKey].columnData;
            for (let column of columns) {
                delete column.id;
            }
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

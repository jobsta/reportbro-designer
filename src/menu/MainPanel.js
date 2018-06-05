import MainPanelItem from './MainPanelItem';
import Container from '../container/Container';
import Document from '../Document';

/**
 * Main panel which contains all report elements like doc elements, parameters and styles.
 * The main panel shows the structure and all components of the report.
 * @class
 */
export default class MainPanel {
    constructor(rootElement, headerBand, contentBand, footerBand, parameterContainer, styleContainer, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.headerItem = new MainPanelItem(
            'band', null, headerBand,
            { hasChildren: true, showAdd: false, showDelete: false, hasDetails: false, visible: this.rb.getDocumentProperties().getValue('header') }, rb);
        
        this.documentItem = new MainPanelItem(
            'band', null, contentBand,
            { hasChildren: true, showAdd: false, showDelete: false, hasDetails: false }, rb);
        
        this.footerItem = new MainPanelItem(
            'band', null, footerBand,
            { hasChildren: true, showAdd: false, showDelete: false, hasDetails: false, visible: this.rb.getDocumentProperties().getValue('footer') }, rb);

        this.parametersItem = new MainPanelItem(
            'parameter', null, parameterContainer,
            { hasChildren: true, showAdd: rb.getProperty('adminMode'), showDelete: false, hasDetails: false }, rb);

        this.stylesItem = new MainPanelItem(
            'style', null, styleContainer,
            { hasChildren: true, showAdd: true, showDelete: false, hasDetails: false }, rb);
        
        this.documentPropertiesItem = new MainPanelItem(
            'documentProperties', null, rb.getDocumentProperties(), { showDelete: false, hasDetails: true }, rb);
        
        this.items = [
            this.headerItem,
            this.documentItem,
            this.footerItem,
            this.parametersItem,
            this.stylesItem,
            this.documentPropertiesItem
        ];

        headerBand.setPanelItem(this.headerItem);
        contentBand.setPanelItem(this.documentItem);
        footerBand.setPanelItem(this.footerItem);
        parameterContainer.setPanelItem(this.parametersItem);
        styleContainer.setPanelItem(this.stylesItem);
    }

    getHeaderItem() {
        return this.headerItem;
    }

    getDocumentItem() {
        return this.documentItem;
    }

    getFooterItem() {
        return this.footerItem;
    }

    getParametersItem() {
        return this.parametersItem;
    }

    getStylesItem() {
        return this.stylesItem;
    }

    getContainerByItem(item) {
        while (item !== null) {
            if (item.getData() instanceof Container) {
                return item.getData();
            }
            item = item.getParent();
        }
        return null;
    }

    getDocumentPropertiesItem() {
        return this.documentPropertiesItem;
    }

    render() {
        let panel = $('#rbro_main_panel_list');
        this.appendChildren(panel, this.items);
    }

    appendChildren(el, items) {
        for (let item of items) {
            el.append(item.getElement());
            let children = item.getChildren();
            if (children.length > 0) {
                let elChildren = $(`#${item.getId()}_children`);
                this.appendChildren(el, children);
            }
        }
    }

    showHeader() {
        this.headerItem.show();
    }

    hideHeader() {
        this.headerItem.hide();
    }

    showFooter() {
        this.footerItem.show();
    }

    hideFooter() {
        this.footerItem.hide();
    }

    clearAll() {
        for (let item of this.items) {
            item.clear();
        }
    }
}

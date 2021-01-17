import { Component, Input, EventEmitter, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FieldUtils, FormUtils, CollectionUtils, StringUtils, KeyMapUtils, ListUtils } from '../../utility';
import { SelectionModel } from '@angular/cdk/collections';
import { Ability } from '@casl/ability';
import { AbilityUtils, ButtonUtils } from '../../utility';
export class ListComponent {
    constructor(ability, breakpointObserver) {
        this.ability = ability;
        this.breakpointObserver = breakpointObserver;
        this.onFormChange = new EventEmitter();
        this.onFieldChange = new EventEmitter();
        this.onButtonClick = new EventEmitter();
        this.onPageChange = new EventEmitter();
        this.onSortChange = new EventEmitter();
        this._expanded = false;
        this.dataSource = new MatTableDataSource();
        this.cellCount = 12;
        this.displayVertical = false;
        this.formIndex = -1;
        this.inlineEditButtons = new Array();
        this.hasDisplayActions = false;
        this.isInlineEditable = false;
        this.inlineButtonSize = "default" /* DEFAULT */;
        this.childRows = new Map();
        this.displayModes = new Array();
        this.columnNames = new Array();
        this.columnConfigs = new Array();
        this.selection = new SelectionModel(true, []);
        this.hideCard = false;
        this.hideHeader = false;
        this.hideFooter = false;
        this.pageSizeOptions = [5, 10, 25, 100];
        this.rowCount = 0;
        this.limit = 0;
        this.rowColors = new Array();
        this.cellColors = new Array();
        this.showCard = false;
        this.sortDirection = 'asc';
        AbilityUtils.setAbility(this.ability);
    }
    get listConfig() {
        return this._listConfig;
    }
    set listConfig(_listConfig) {
        this._listConfig = _listConfig;
        this.setColumnNames();
        this.setDetailColumnCount();
        this.setCardVisibility();
    }
    get record() {
        return this._record;
    }
    set record(_record) {
        // console.log("-------------->")
        // console.log(_record);
        // console.log(this._record);
        // console.log("<--------------")
        if (!this.parent || (this.parent && JSON.stringify(_record) != JSON.stringify(this._record))) {
            this._record = _record;
            this.init();
            this.setCardVisibility();
        }
    }
    get listReset() {
        return this._listReset;
    }
    set listReset(_listReset) {
        this._listReset = _listReset;
        if (this._listReset) {
            this.resetInlineEditButton('inlineEditButton', 'Edit', 'edit');
        }
    }
    get expanded() {
        return this._expanded;
    }
    set expanded(_expanded) {
        this._expanded = _expanded;
    }
    set contentPage(pagination) {
        this.dataSource.paginator = pagination;
    }
    set contentSort(sort) {
        this.dataSource.sort = sort;
    }
    ngOnInit() {
    }
    init() {
        this.getLayout();
        this.setPageSize();
        if (this._record === undefined) {
            this._record = { total: 10, pageNo: 1, rows: [] };
        }
        if (this._record && this._record.rows) {
            if (this._record.rows.length != this.rowCount) {
                this._record.rows = [...this._record.rows];
                this.dataSource.data = this._record.rows;
            }
        }
        this.resetInlineEditButton('inlineEditButton', 'Edit', 'edit');
        this.populateAllChilds();
        this.showRowEditable();
        this.initCommonFormGroup();
        this.setColors();
        this.setIconPosition();
        this.setFilterBar();
        ListUtils.setCustomLayouts(this.listConfig);
    }
    sticky() {
        let header1 = document.querySelectorAll(".mat-toolbar");
        let header = document.getElementById("mySearch");
        if (header) {
            let sticky = header.offsetTop;
            if (window.pageYOffset > sticky) {
                header.classList.add("sticky");
                header1.forEach((el) => {
                    el.classList.add("sticky-header");
                });
            }
            else {
                header.classList.remove("sticky");
                header1.forEach((el) => {
                    el.classList.remove("sticky-header");
                });
            }
        }
    }
    onScrolled(event) {
    }
    setFilterBar() {
        if (this._listConfig.staticList.hasOnPageFilter && !this._listConfig.hasColumnSelection) {
            this.contentFilterColumnSpan = 12;
        }
        if (!this._listConfig.staticList.hasOnPageFilter && this._listConfig.hasColumnSelection) {
            this.columnSelectionColumnSpan = 12;
        }
    }
    setPageSize() {
        if (this._listConfig.pagination == "ALL" /* ALL */) {
            this.limit = this._record && this._record.rows ? this._record.rows.length : 10;
        }
        else {
            if (this._listConfig.pageSize) {
                this.limit = this._listConfig.pageSize;
            }
        }
    }
    setIconPosition() {
        this.iconPosition = "BEFORE_TITLE" /* BEFORE_TITLE */;
        if (this._listConfig.header && this._listConfig.header.icon && this._listConfig.header.icon.position) {
            this.iconPosition = this._listConfig.header.icon.position;
        }
    }
    getFilterField() {
        this.filterField = {
            key: "pageFilter",
            label: "Filter",
            type: "TEXT" /* TEXT */,
            icon: "search",
            appearance: "STANDARD" /* STANDARD */,
            isReadOnly: false,
            fieldDisplayType: "INLINE" /* INLINE */,
            placeholder: "Type to display filtered list",
            value: ""
        };
        return this.filterField;
    }
    getColumnSelectorField() {
        this.columnSelectorField = ListUtils.getColumnSelectorField(this._listConfig);
        return this.columnSelectorField;
    }
    updateColumnDisplay(event) {
        console.log(event);
        for (let column of this._listConfig.columns) {
            if (event.value.indexOf(ListUtils.getColumnKey(column)) > -1) {
                column.show = true;
            }
            else {
                column.show = false;
            }
        }
        this.setColumnNames();
        this.setDetailColumnCount();
    }
    inlinEditButton(identifier, label, icon) {
        let buttonConfig = {
            identifier: identifier,
            type: "RAISED" /* RAISED */,
            label: label,
            color: "primary" /* PRIMARY */,
            size: "small" /* SMALL */,
            icon: icon,
            onlyIcon: false
        };
        return buttonConfig;
    }
    getColumnLabel(column) {
        return ListUtils.getColumnLabel(column);
    }
    getColumnKey(column) {
        return ListUtils.getColumnKey(column);
    }
    resetInlineEditButton(identifier, label, icon) {
        for (let cIndex = 0; cIndex < this.columnConfigs.length; cIndex++) {
            if (!CollectionUtils.isEmpty(this._listConfig.actions)) {
                for (let action of this._listConfig.actions) {
                    if (action.permission == null || (this.ability.can(action.permission['action'], action.permission['subject']))) {
                        this.hasDisplayActions = true;
                        break;
                    }
                }
            }
            if (this.hasDisplayActions) {
                for (let field of this.columnConfigs[cIndex].fields) {
                    if (FieldUtils.readOnlyField().indexOf(field.type) > -1) { }
                    else {
                        this.isInlineEditable = true;
                        break;
                    }
                }
            }
        }
        this.inlineEditButtons = new Array();
        if (this._record && this._record.rows) {
            for (let index = 0; index < this._record.rows.length; index++) {
                this.inlineEditButtons.push(this.inlinEditButton(identifier, label, icon));
                this.displayModes[index] = "VIEW" /* VIEW */;
            }
        }
        this.formIndex = -1;
        this.setColumnNames();
    }
    showRowEditable() {
        if (!CollectionUtils.isEmpty(this._listConfig.actions)) {
            this.inlineButtonSize = this._listConfig.actions[0].size;
        }
        if (this._record && this._record.rows) {
            for (let index = 0; index < this._record.rows.length; index++) {
                if (this._record.rows[index]['showRowEditable']) {
                    this.setRowEditablity(index);
                }
            }
        }
    }
    setRowEditablity(index) {
        if (this.formIndex != -1 && this.formIndex != index) {
            this.inlineEditButtons[this.formIndex].identifier = 'inlineEditButton';
            this.inlineEditButtons[this.formIndex].label = 'Edit';
            this.inlineEditButtons[this.formIndex].icon = 'edit';
            this.inlineEditButtons[this.formIndex].size = this.inlineButtonSize;
            this.formIndex = -1;
        }
        if (this.inlineEditButtons[index].label == 'Edit') {
            this.inlineEditButtons[index].identifier = 'cancelInlineStaticList';
            this.inlineEditButtons[index].label = 'Cancel';
            this.inlineEditButtons[index].icon = 'close';
            this.inlineEditButtons[index].size = this.inlineButtonSize;
            if (this._record && this._record.rows) {
                for (let rIndex = 0; rIndex < this._record.rows.length; rIndex++) {
                    this.displayModes[rIndex] = "VIEW" /* VIEW */;
                    if (rIndex != index) {
                        this.inlineEditButtons[rIndex].identifier = 'inlineEditButton';
                        this.inlineEditButtons[rIndex].label = 'Edit';
                        this.inlineEditButtons[rIndex].icon = 'edit';
                        this.inlineEditButtons[rIndex].size = this.inlineButtonSize;
                    }
                }
                if (this._record.rows[index]['formDisplayMode']) {
                    this.displayModes[index] = this._record.rows[index]['formDisplayMode'];
                }
                else {
                    this.displayModes[index] = "EDIT" /* EDIT */;
                }
            }
            this.initFormGroup(index);
            this.formIndex = index;
            this._listReset = false;
        }
        else {
            this.inlineEditButtons[index].identifier = 'inlineEditButton';
            this.inlineEditButtons[index].label = 'Edit';
            this.inlineEditButtons[index].icon = 'edit';
            this.inlineEditButtons[index].size = this.inlineButtonSize;
            this.formIndex = -1;
        }
        let inlineButtonTemp = this.inlineEditButtons[index];
        this.inlineEditButtons[index] = undefined;
        setTimeout(() => this.inlineEditButtons[index] = inlineButtonTemp, 100);
    }
    populateAllChilds() {
        if (this._record && this._record.rows && this._record.rows.length > 0) {
            for (let rIndex = 0; rIndex < this._record.rows.length; rIndex++) {
                this.childRows[rIndex] = this.getChildRows(this._record.rows[rIndex]);
            }
        }
    }
    getChildRows(row) {
        if (this._listConfig && this._listConfig.child && row) {
            let data = this._listConfig.child.recordIdentifier ? row[this._listConfig.child.recordIdentifier] : row;
            if (this._listConfig.child.type == "LIST" /* LIST */) {
                if (data) {
                    let childData;
                    if (data instanceof Array) {
                        childData = data;
                    }
                    else {
                        childData = new Array();
                        childData.push(data);
                    }
                    let record = {
                        pageNo: 1,
                        total: childData.length,
                        rows: childData
                    };
                    return record;
                }
            }
            else {
                return data;
            }
        }
    }
    getValue(colIndex, cFieldIndex, row, value) {
        try {
            value = eval("row." + this.columnConfigs[colIndex].fields[cFieldIndex].key);
        }
        catch (e) { }
        return value;
    }
    updateFilter(field) {
        const filterValue = field.value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }
    initFormGroup(cnt) {
        let fieldControls = {};
        let row = this.getCurrentRecord(cnt);
        KeyMapUtils.setOptionssUsingValues(this.keyMap, false, "LIST" /* LIST */, this._listConfig, row);
        for (let column of this.columnConfigs) {
            for (let field of column.fields) {
                let formField = { field: field, addMore: false };
                if (this._listConfig.uniqueKeys.indexOf(formField.field.key) > -1) {
                    formField.field.isUnique = true;
                }
                FormUtils.initFieldGroup(fieldControls, formField, null, row, this.displayModes[cnt]);
            }
        }
        this.form = new FormGroup(fieldControls);
        this.formIndex = cnt;
    }
    initCommonFormGroup() {
        let commonFieldControls = {};
        FormUtils.initFieldGroup(commonFieldControls, { field: this.getFilterField(), addMore: false }, {}, {}, "EDIT" /* EDIT */);
        FormUtils.initFieldGroup(commonFieldControls, { field: this.getColumnSelectorField(), addMore: false }, {}, {}, "EDIT" /* EDIT */);
        this.commonListForm = new FormGroup(commonFieldControls);
    }
    getCurrentRecord(cnt) {
        let record = {};
        if (this.dataSource && this.dataSource['_renderData'] && this.dataSource['_renderData']['_value'] && this.dataSource['_renderData']['_value'][cnt]) {
            record = this.dataSource['_renderData']['_value'][cnt];
        }
        else if (this._record && this._record['rows'] && this._record['rows'][cnt]) {
            record = this._record['rows'][cnt];
        }
        return record;
    }
    getObjectTree(currentRow) {
        if (this._listConfig && this._listConfig.uniqueKeys && this._listConfig.uniqueKeys.length > 0) {
            let keys = this._listConfig.uniqueKeys;
            let values = new Array();
            keys.forEach(key => values.push(currentRow[key]));
            let objectTree = {
                parent: {
                    key: values
                }
            };
            if (this.parent) {
                objectTree.hierarchyUp = JSON.parse(JSON.stringify(this.parent));
            }
            return objectTree;
        }
        else {
            return null;
        }
    }
    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }
    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }
    /** The label for the checkbox on the passed row */
    checkboxLabel(row) {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }
    setCardVisibility() {
        this.hideCard = false;
        if (this._listConfig.hideCard || (this._listConfig.hideHeader && this._listConfig.hideFooter)) {
            this.hideCard = true;
        }
        if (this.hideCard == false) {
            if (this._record && this._record.rows && this._record.rows.length == this._record.total && (StringUtils.isEmpty(this._listConfig.header) && this._listConfig.description)) {
                this.hideCard = true;
            }
        }
        this.hideHeader = false;
        if ((!this._listConfig.header || StringUtils.isEmpty(this._listConfig.header.title)) && StringUtils.isEmpty(this._listConfig.description) || this._listConfig.hideHeader) {
            this.hideHeader = true;
        }
        this.hideFooter = false;
        if ((this._record && this._record.rows && this._record.rows.length == this._record.total) || this._listConfig.hideFooter) {
            this.hideFooter = true;
        }
    }
    setColumnNames() {
        this.columnNames = new Array();
        this.columnConfigs = new Array();
        this.totalDispalyableWidth = 0;
        if (this._listConfig.selectable) {
            this.columnNames.push('select');
            if (!this._listConfig.header) {
                this._listConfig.header = { title: "" };
            }
            if (!this._listConfig.header || CollectionUtils.isEmpty(this._listConfig.header.actions)) {
                this._listConfig.header.actions = new Array();
            }
            let selectableExist = false;
            for (let button of this._listConfig.header.actions) {
                if (button.identifier == "listCrudSelectionButton") {
                    selectableExist = true;
                }
            }
            if (!selectableExist) {
                this._listConfig.header.actions.unshift(this.selectableButton("listCrudSelectionButton", this._listConfig.selectable.label, this._listConfig.selectable.icon));
            }
        }
        if (this._listConfig.columns && this._listConfig.columns.length > 0) {
            this._listConfig.columns.filter(column => column.show == true).forEach(column => {
                let hasDisplayableField = false;
                for (let field of column.fields) {
                    if (field.permission == null || this.ability.can(field.permission['action'], field.permission['subject'])) {
                        hasDisplayableField = true;
                    }
                }
                if (hasDisplayableField) {
                    this.columnNames.push(ListUtils.getColumnKey(column));
                    this.columnConfigs.push(column);
                    this.totalDispalyableWidth += column.width;
                }
            });
        }
        if (this.hasDisplayActions) {
            this.columnNames.push('action');
            this.totalDispalyableWidth += this._listConfig.actionWidth;
        }
    }
    setDetailColumnCount() {
        this.childColumnCount = this.columnConfigs.length + (this._listConfig.actions && this._listConfig.actions.length > 0 ? 1 : 0) + (this._listConfig.selectable ? 1 : 0);
    }
    setColors() {
        if (this._record && this._record.rows) {
            for (let rIndex = 0; rIndex < this._record.rows.length; rIndex++) {
                if (CollectionUtils.isEmpty(this.rowColors[rIndex])) {
                    this.rowColors.push({ bgColor: "", textColor: "" });
                }
                let rowColor = this.rowColors[rIndex];
                if (this._listConfig.rowBgColor) {
                    rowColor.bgColor = this._listConfig.rowBgColor(this._record.rows[rIndex]);
                }
                if (this._listConfig.rowTextColor) {
                    rowColor.textColor = this._listConfig.rowTextColor(this._record.rows[rIndex]);
                }
                for (let cIndex = 0; cIndex < this.columnConfigs.length; cIndex++) {
                    if (CollectionUtils.isEmpty(this.cellColors[rIndex])) {
                        this.cellColors.push(new Array());
                    }
                    if (CollectionUtils.isEmpty(this.cellColors[rIndex][cIndex])) {
                        this.cellColors[rIndex][cIndex] = { bgColor: "", textColor: "" };
                    }
                    let cellColor = this.cellColors[rIndex][cIndex];
                    if (StringUtils.isEmpty(cellColor.bgColor)) {
                        cellColor.bgColor = rowColor.bgColor;
                    }
                    if (this.columnConfigs[cIndex].bgColor) {
                        cellColor.bgColor = this.columnConfigs[cIndex].bgColor(this._record.rows[rIndex]);
                    }
                    if (StringUtils.isEmpty(cellColor.textColor)) {
                        cellColor.textColor = rowColor.textColor;
                    }
                    if (this.columnConfigs[cIndex].textColor) {
                        cellColor.textColor = this.columnConfigs[cIndex].textColor(this._record.rows[rIndex]);
                    }
                }
            }
        }
    }
    selectableButton(identifier, label, icon) {
        return {
            identifier: identifier,
            label: label,
            color: "primary" /* PRIMARY */,
            size: "small" /* SMALL */,
            icon: icon,
            type: "FLAT" /* FLAT */,
            onlyIcon: false
        };
    }
    fieldChange(fieldChange) {
        console.log(fieldChange);
        this.onFieldChange.emit(fieldChange);
        this.formChange(this.form);
        //  if a field options are dependent on me, then reload its options 
        fieldChange.fieldKey;
        this._listConfig.columns.forEach(column => {
            column.fields.forEach(field => {
                if (field.optionDependsOn == fieldChange.fieldKey) {
                    let row = FormUtils.getRawValue(this.form);
                    //let row = this.getCurrentRecord(fieldChange.sourceIndex);
                    KeyMapUtils.setOptionssUsingValues(this.keyMap, false, "LIST" /* LIST */, this._listConfig, row);
                }
            });
        });
    }
    formChange(form) {
        console.log(form);
        if (form == undefined) {
            this.onFormChange.emit(this.form);
        }
        else {
            this.onFormChange.emit(form);
        }
    }
    buttonClick(action) {
        console.log(action);
        if (action.action == 'listCrudSelectionButton') {
            action.data = this.selection.selected;
        }
        if (action.action == "row_expand" /* ROW_EXPAND */ || action.action == "row_collapse" /* ROW_COLLAPSE */) {
        }
        else {
            action.event.stopPropagation();
        }
        this.onButtonClick.emit(action);
    }
    getLayout() {
        this.breakpointSubscription = this.breakpointObserver.observe([
            Breakpoints.XSmall,
            Breakpoints.Small,
            Breakpoints.Medium,
            Breakpoints.Large,
            Breakpoints.XLarge
        ]).subscribe((state) => {
            if (state.breakpoints[Breakpoints.XSmall]) {
                this.isMobile = true;
                this.cellCount = this.listConfig.mobile && this.listConfig.mobile.cellCount ? this.listConfig.mobile.cellCount : 4;
                this.hideCard = true;
                ListUtils.getMobileConfig(this.listConfig);
                console.log('Matches XSmall viewport');
            }
            if (state.breakpoints[Breakpoints.Small]) {
                this.isTablet = true;
                console.log('Matches Small viewport');
            }
            if (state.breakpoints[Breakpoints.Medium]) {
                this.isDesktop = true;
                console.log('Matches Medium  viewport');
            }
            if (state.breakpoints[Breakpoints.Large]) {
                this.isDesktop = true;
                console.log('Matches Large viewport');
            }
            if (state.breakpoints[Breakpoints.XLarge]) {
                this.isDesktop = true;
                console.log('Matches XLarge viewport');
            }
            this.resetVerticalDisplay();
        });
    }
    rowClick(row, rowIndex, context, event) {
        console.log(row);
        console.log(rowIndex);
        console.log(context);
        let actionButton = null;
        if (!CollectionUtils.isEmpty(this._listConfig.actions)) {
            this._listConfig.actions.forEach(action => {
                if (action.identifier == this._listConfig.rowAction) {
                    actionButton = action;
                }
            });
            if (actionButton != null) {
                let actionObj = ButtonUtils.getAction(this._listConfig.identifier, rowIndex, this.widgetArrayIndex, actionButton.identifier, this.parent, event, row, context, null);
                this.onButtonClick.emit(actionObj);
            }
        }
    }
    resetVerticalDisplay() {
        // if (this._listConfig.mobile && this._listConfig.mobile.displayVertical && this.isMobile) {
        //   this.displayVertical = true;
        // }
    }
    getButton(cell) {
        let buttons = new Array();
        if (!CollectionUtils.isEmpty(cell) && !CollectionUtils.isEmpty(cell.controls)) {
            buttons = cell.controls.filter(control => control.type == "BUTTON" /* BUTTON */).map(control => control.control);
        }
        return buttons;
    }
    onHover(event, rowIndex, row) {
        this.hoverRowData = row;
        this.hoverRowIndex = rowIndex;
    }
    ngOnDestroy() {
        if (this.breakpointSubscription) {
            this.breakpointSubscription.unsubscribe();
        }
    }
}
ListComponent.decorators = [
    { type: Component, args: [{
                selector: 'cf-list',
                template: "<p>list works!</p>\n",
                animations: [
                    trigger('detailExpand', [
                        state('collapsed', style({ height: '0px', minHeight: '0' })),
                        state('expanded', style({ height: '*' })),
                        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
                    ]),
                ],
                encapsulation: ViewEncapsulation.None,
                styles: [""]
            },] }
];
ListComponent.ctorParameters = () => [
    { type: Ability },
    { type: BreakpointObserver }
];
ListComponent.propDecorators = {
    _listConfig: [{ type: Input }],
    listConfig: [{ type: Input }],
    _record: [{ type: Input }],
    record: [{ type: Input }],
    sourceIdentifier: [{ type: Input }],
    sourceIndex: [{ type: Input }],
    widgetArrayIndex: [{ type: Input }],
    originalData: [{ type: Input }],
    parent: [{ type: Input }],
    _listReset: [{ type: Input }],
    listReset: [{ type: Input }],
    disabled: [{ type: Input }],
    keyMap: [{ type: Input }],
    onFormChange: [{ type: Output }],
    onFieldChange: [{ type: Output }],
    onButtonClick: [{ type: Output }],
    onPageChange: [{ type: Output }],
    onSortChange: [{ type: Output }],
    expanded: [{ type: Input }],
    expandRowIndex: [{ type: Input }],
    contentPage: [{ type: ViewChild, args: [MatPaginator, { static: false },] }],
    contentSort: [{ type: ViewChild, args: [MatSort, { static: false },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL25pdGlua2hhaXRhbi9OaXRpbi9zdHVkeS9hbmd1bGFyL21hdGVyaWFsL2FkbWluLWJ1aWxkZXItcGx1Z2luL3Byb2plY3RzL2FkbWluLWJ1aWxkZXIvc3JjLyIsInNvdXJjZXMiOlsibGliL2xpc3QvY29tcG9uZW50L2xpc3QuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQXFCLEtBQUssRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV4SCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyxFQUFtQixNQUFNLHFCQUFxQixDQUFDO0FBTXZGLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDM0QsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2pELE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDakYsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVHLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3hDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBaUIxRCxNQUFNLE9BQU8sYUFBYTtJQXlIeEIsWUFBbUIsT0FBZ0Is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QyxVQUFVLEVBQUUsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7d0JBQ3pDLFVBQVUsQ0FBQyx3QkFBd0IsRUFBRSxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztxQkFDdEYsQ0FBQztpQkFDSDtnQkFDRCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7YUFDdEM7OztZQWpCUSxPQUFPO1lBYlAsa0JBQWtCOzs7MEJBZ0N4QixLQUFLO3lCQUlMLEtBQUs7c0JBUUwsS0FBSztxQkFJTCxLQUFLOytCQWNMLEtBQUs7MEJBQ0wsS0FBSzsrQkFDTCxLQUFLOzJCQUNMLEtBQUs7cUJBQ0wsS0FBSzt5QkFDTCxLQUFLO3dCQUlMLEtBQUs7dUJBU0wsS0FBSztxQkFDTCxLQUFLOzJCQUNMLE1BQU07NEJBQ04sTUFBTTs0QkFDTixNQUFNOzJCQUNOLE1BQU07MkJBQ04sTUFBTTt1QkFNTixLQUFLOzZCQUtMLEtBQUs7MEJBS0wsU0FBUyxTQUFDLFlBQVksRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7MEJBS3pDLFNBQVMsU0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQsIE9uRGVzdHJveSwgSW5wdXQsIEV2ZW50RW1pdHRlciwgT3V0cHV0LCBWaWV3Q2hpbGQsIFZpZXdFbmNhcHN1bGF0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEJyZWFrcG9pbnRPYnNlcnZlciwgQnJlYWtwb2ludHMsIEJyZWFrcG9pbnRTdGF0ZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9sYXlvdXQnO1xuXG5pbXBvcnQgeyBMaXN0LCBSZWNvcmQsIFBhZ2luYXRpb25UeXBlLCBDZWxsQ29sb3IsIENvbHVtbiwgQ2hpbGRMaXN0VHlwZSwgQ3VzdG9tTGF5b3V0Q2VsbCwgQ2VsbENvbnRyb2xsVHlwZSwgQ2VsbENvbnRyb2wgfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQgeyBPYmplY3RUcmVlLCBCdXR0b24sIEJ1dHRvblR5cGUsIEJ1dHRvbkNvbG9yLCBCdXR0b25TaXplLCBBY3Rpb24sIFJlc2VydmVkQnV0dG9uIH0gZnJvbSAnLi4vLi4vYnV0dG9uL21vZGVsJztcbmltcG9ydCB7IEtleU1hcCwgRmllbGRUeXBlLCBGaWVsZEFwcGVhcmFuY2UsIEZpZWxkRGlhcGx5VHlwZSwgVGV4dEZpZWxkLCBEcm9wZG93bk9wdGlvbiwgRHJvcGRvd25GaWVsZCwgRmllbGRDaGFuZ2UsIEtleU1hcE9wdGlvblR5cGUsIEF1dG9jb21wbGV0ZUZpZWxkLCBSYWRpb0ZpZWxkLCBDaGVja2JveEZpZWxkIH0gZnJvbSAnLi4vLi4vZmllbGQvbW9kZWwnO1xuaW1wb3J0IHsgRm9ybURpYXBseU1vZGUsIEZvcm1GaWVsZCwgRm9ybVRpdGxlSWNvblBvc2l0aW9uIH0gZnJvbSAnLi4vLi4vZm9ybS9tb2RlbCc7XG5pbXBvcnQgeyBGb3JtR3JvdXAgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBNYXRUYWJsZURhdGFTb3VyY2UgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC90YWJsZSc7XG5pbXBvcnQgeyBNYXRQYWdpbmF0b3IgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9wYWdpbmF0b3InO1xuaW1wb3J0IHsgTWF0U29ydCB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3NvcnQnO1xuaW1wb3J0IHsgdHJpZ2dlciwgc3RhdGUsIHN0eWxlLCB0cmFuc2l0aW9uLCBhbmltYXRlIH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQgeyBGaWVsZFV0aWxzLCBGb3JtVXRpbHMsIENvbGxlY3Rpb25VdGlscywgU3RyaW5nVXRpbHMsIEtleU1hcFV0aWxzLCBMaXN0VXRpbHMgfSBmcm9tICcuLi8uLi91dGlsaXR5JztcbmltcG9ydCB7IFNlbGVjdGlvbk1vZGVsIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7IEFiaWxpdHkgfSBmcm9tICdAY2FzbC9hYmlsaXR5JztcbmltcG9ydCB7IEFiaWxpdHlVdGlscywgQnV0dG9uVXRpbHMgfSBmcm9tICcuLi8uLi91dGlsaXR5JztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgdGltZUludGVydmFsIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdjZi1saXN0JyxcbiAgdGVtcGxhdGVVcmw6ICcuL2xpc3QuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9saXN0LmNvbXBvbmVudC5zY3NzJ10sXG4gIGFuaW1hdGlvbnM6IFtcbiAgICB0cmlnZ2VyKCdkZXRhaWxFeHBhbmQnLCBbXG4gICAgICBzdGF0ZSgnY29sbGFwc2VkJywgc3R5bGUoeyBoZWlnaHQ6ICcwcHgnLCBtaW5IZWlnaHQ6ICcwJyB9KSksXG4gICAgICBzdGF0ZSgnZXhwYW5kZWQnLCBzdHlsZSh7IGhlaWdodDogJyonIH0pKSxcbiAgICAgIHRyYW5zaXRpb24oJ2V4cGFuZGVkIDw9PiBjb2xsYXBzZWQnLCBhbmltYXRlKCcyMjVtcyBjdWJpYy1iZXppZXIoMC40LCAwLjAsIDAuMiwgMSknKSksXG4gICAgXSksXG4gIF0sXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgTGlzdENvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgX2xpc3RDb25maWc6IExpc3Q7XG4gIGdldCBsaXN0Q29uZmlnKCk6IExpc3Qge1xuICAgIHJldHVybiB0aGlzLl9saXN0Q29uZmlnO1xuICB9XG4gIEBJbnB1dCgpXG4gIHNldCBsaXN0Q29uZmlnKF9saXN0Q29uZmlnOiBMaXN0KSB7XG4gICAgdGhpcy5fbGlzdENvbmZpZyA9IF9saXN0Q29uZmlnO1xuICAgIHRoaXMuc2V0Q29sdW1uTmFtZXMoKTtcbiAgICB0aGlzLnNldERldGFpbENvbHVtbkNvdW50KCk7XG4gICAgdGhpcy5zZXRDYXJkVmlzaWJpbGl0eSgpO1xuICB9XG5cbiAgQElucHV0KCkgX3JlY29yZDogUmVjb3JkO1xuICBnZXQgcmVjb3JkKCk6IFJlY29yZCB7XG4gICAgcmV0dXJuIHRoaXMuX3JlY29yZDtcbiAgfVxuICBASW5wdXQoKVxuICBzZXQgcmVjb3JkKF9yZWNvcmQ6IFJlY29yZCkge1xuICAgIC8vIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0+XCIpXG4gICAgLy8gY29uc29sZS5sb2coX3JlY29yZCk7XG4gICAgLy8gY29uc29sZS5sb2codGhpcy5fcmVjb3JkKTtcbiAgICAvLyBjb25zb2xlLmxvZyhcIjwtLS0tLS0tLS0tLS0tLVwiKVxuICAgIGlmICghdGhpcy5wYXJlbnQgfHwgKHRoaXMucGFyZW50ICYmIEpTT04uc3RyaW5naWZ5KF9yZWNvcmQpICE9IEpTT04uc3RyaW5naWZ5KHRoaXMuX3JlY29yZCkpKSB7XG4gICAgICB0aGlzLl9yZWNvcmQgPSBfcmVjb3JkO1xuXG4gICAgICB0aGlzLmluaXQoKTtcbiAgICAgIHRoaXMuc2V0Q2FyZFZpc2liaWxpdHkoKTtcbiAgICB9XG4gIH1cblxuICBASW5wdXQoKSBzb3VyY2VJZGVudGlmaWVyOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHNvdXJjZUluZGV4OiBudW1iZXI7XG4gIEBJbnB1dCgpIHdpZGdldEFycmF5SW5kZXg6IG51bWJlcjtcbiAgQElucHV0KCkgb3JpZ2luYWxEYXRhOiBhbnk7XG4gIEBJbnB1dCgpIHBhcmVudDogT2JqZWN0VHJlZTtcbiAgQElucHV0KCkgX2xpc3RSZXNldDogYm9vbGVhbjtcbiAgZ2V0IGxpc3RSZXNldCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fbGlzdFJlc2V0O1xuICB9XG4gIEBJbnB1dCgpXG4gIHNldCBsaXN0UmVzZXQoX2xpc3RSZXNldDogYm9vbGVhbikge1xuICAgIHRoaXMuX2xpc3RSZXNldCA9IF9saXN0UmVzZXQ7XG5cbiAgICBpZiAodGhpcy5fbGlzdFJlc2V0KSB7XG4gICAgICB0aGlzLnJlc2V0SW5saW5lRWRpdEJ1dHRvbignaW5saW5lRWRpdEJ1dHRvbicsICdFZGl0JywgJ2VkaXQnKTtcbiAgICB9XG4gIH1cblxuICBASW5wdXQoKSBkaXNhYmxlZDogYm9vbGVhbjtcbiAgQElucHV0KCkga2V5TWFwOiBBcnJheTxLZXlNYXA+O1xuICBAT3V0cHV0KCkgb25Gb3JtQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgb25GaWVsZENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIG9uQnV0dG9uQ2xpY2sgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBvblBhZ2VDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBvblNvcnRDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgX2V4cGFuZGVkOiBib29sZWFuID0gZmFsc2U7XG4gIGdldCBleHBhbmRlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZXhwYW5kZWQ7XG4gIH1cbiAgQElucHV0KClcbiAgc2V0IGV4cGFuZGVkKF9leHBhbmRlZDogYm9vbGVhbikge1xuICAgIHRoaXMuX2V4cGFuZGVkID0gX2V4cGFuZGVkO1xuICB9XG5cbiAgQElucHV0KClcbiAgZXhwYW5kUm93SW5kZXg6IG51bWJlcjtcblxuICBkYXRhU291cmNlOiBNYXRUYWJsZURhdGFTb3VyY2U8YW55PiA9IG5ldyBNYXRUYWJsZURhdGFTb3VyY2UoKTtcblxuICBAVmlld0NoaWxkKE1hdFBhZ2luYXRvciwgeyBzdGF0aWM6IGZhbHNlIH0pIHNldCBjb250ZW50UGFnZShwYWdpbmF0aW9uOiBNYXRQYWdpbmF0b3IpIHtcbiAgICB0aGlzLmRhdGFTb3VyY2UucGFnaW5hdG9yID0gcGFnaW5hdGlvbjtcbiAgfVxuXG5cbiAgQFZpZXdDaGlsZChNYXRTb3J0LCB7IHN0YXRpYzogZmFsc2UgfSkgc2V0IGNvbnRlbnRTb3J0KHNvcnQ6IE1hdFNvcnQpIHtcbiAgICB0aGlzLmRhdGFTb3VyY2Uuc29ydCA9IHNvcnQ7XG4gIH1cblxuICBjZWxsQ291bnQ6IG51bWJlciA9IDEyO1xuICBpc01vYmlsZTogYm9vbGVhbjtcbiAgaXNUYWJsZXQ6IGJvb2xlYW47XG4gIGlzRGVza3RvcDogYm9vbGVhbjtcbiAgZGlzcGxheVZlcnRpY2FsOiBib29sZWFuID0gZmFsc2U7XG5cbiAgZm9ybTogRm9ybUdyb3VwO1xuICBjb21tb25MaXN0Rm9ybTogRm9ybUdyb3VwO1xuICBmb3JtSW5kZXg6IG51bWJlciA9IC0xO1xuXG4gIGlubGluZUVkaXRCdXR0b25zOiBBcnJheTxCdXR0b24+ID0gbmV3IEFycmF5PEJ1dHRvbj4oKTtcbiAgaGFzRGlzcGxheUFjdGlvbnM6IGJvb2xlYW4gPSBmYWxzZTtcbiAgaXNJbmxpbmVFZGl0YWJsZTogYm9vbGVhbiA9IGZhbHNlO1xuICBpbmxpbmVCdXR0b25TaXplOiBCdXR0b25TaXplID0gQnV0dG9uU2l6ZS5ERUZBVUxUO1xuICBjaGlsZFJvd3M6IE1hcDxudW1iZXIsIFJlY29yZD4gPSBuZXcgTWFwPG51bWJlciwgUmVjb3JkPigpO1xuICBjaGlsZENvbHVtbkNvdW50OiBudW1iZXI7XG5cbiAgZGlzcGxheU1vZGVzOiBBcnJheTxGb3JtRGlhcGx5TW9kZT4gPSBuZXcgQXJyYXk8Rm9ybURpYXBseU1vZGU+KCk7XG4gIGNvbHVtbk5hbWVzOiBBcnJheTxzdHJpbmc+ID0gbmV3IEFycmF5PHN0cmluZz4oKTtcbiAgY29sdW1uQ29uZmlnczogQXJyYXk8Q29sdW1uPiA9IG5ldyBBcnJheTxDb2x1bW4+KCk7XG4gIHRvdGFsRGlzcGFseWFibGVXaWR0aDogbnVtYmVyO1xuXG4gIHNlbGVjdGlvbiA9IG5ldyBTZWxlY3Rpb25Nb2RlbDxhbnk+KHRydWUsIFtdKTtcbiAgaGlkZUNhcmQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgaGlkZUhlYWRlcjogYm9vbGVhbiA9IGZhbHNlO1xuICBoaWRlRm9vdGVyOiBib29sZWFuID0gZmFsc2U7XG5cbiAgcGFnZVNpemVPcHRpb25zOiBBcnJheTxudW1iZXI+ID0gWzUsIDEwLCAyNSwgMTAwXTtcbiAgcm93Q291bnQ6IG51bWJlciA9IDA7XG4gIGxpbWl0OiBudW1iZXIgPSAwO1xuICBleHBhbmRlZFJvdzogYW55IHwgbnVsbDtcbiAgcm93Q29sb3JzOiBBcnJheTxDZWxsQ29sb3I+ID0gbmV3IEFycmF5PENlbGxDb2xvcj4oKTtcbiAgY2VsbENvbG9yczogQXJyYXk8QXJyYXk8Q2VsbENvbG9yPj4gPSBuZXcgQXJyYXk8QXJyYXk8Q2VsbENvbG9yPj4oKTtcbiAgaG92ZXJSb3dEYXRhOiBhbnk7XG4gIGhvdmVyUm93SW5kZXg6IG51bWJlcjtcblxuICBzaG93Q2FyZCA9IGZhbHNlO1xuICBpY29uUG9zaXRpb246IEZvcm1UaXRsZUljb25Qb3NpdGlvbjtcblxuICBicmVha3BvaW50U3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG5cbiAgY29uc3RydWN0b3IocHVibGljIGFiaWxpdHk6IEFiaWxpdHksIHB1YmxpYyBicmVha3BvaW50T2JzZXJ2ZXI6IEJyZWFrcG9pbnRPYnNlcnZlcikge1xuICAgIEFiaWxpdHlVdGlscy5zZXRBYmlsaXR5KHRoaXMuYWJpbGl0eSk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy5nZXRMYXlvdXQoKTtcblxuICAgIHRoaXMuc2V0UGFnZVNpemUoKTtcbiAgICBpZiAodGhpcy5fcmVjb3JkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX3JlY29yZCA9IHsgdG90YWw6IDEwLCBwYWdlTm86IDEsIHJvd3M6IFtdIH07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3JlY29yZCAmJiB0aGlzLl9yZWNvcmQucm93cykge1xuICAgICAgaWYgKHRoaXMuX3JlY29yZC5yb3dzLmxlbmd0aCAhPSB0aGlzLnJvd0NvdW50KSB7XG4gICAgICAgIHRoaXMuX3JlY29yZC5yb3dzID0gWy4uLnRoaXMuX3JlY29yZC5yb3dzXTtcblxuICAgICAgICB0aGlzLmRhdGFTb3VyY2UuZGF0YSA9IHRoaXMuX3JlY29yZC5yb3dzO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucmVzZXRJbmxpbmVFZGl0QnV0dG9uKCdpbmxpbmVFZGl0QnV0dG9uJywgJ0VkaXQnLCAnZWRpdCcpO1xuICAgIHRoaXMucG9wdWxhdGVBbGxDaGlsZHMoKTtcblxuICAgIHRoaXMuc2hvd1Jvd0VkaXRhYmxlKCk7XG4gICAgdGhpcy5pbml0Q29tbW9uRm9ybUdyb3VwKCk7XG4gICAgdGhpcy5zZXRDb2xvcnMoKTtcbiAgICB0aGlzLnNldEljb25Qb3NpdGlvbigpO1xuICAgIHRoaXMuc2V0RmlsdGVyQmFyKCk7XG5cbiAgICBMaXN0VXRpbHMuc2V0Q3VzdG9tTGF5b3V0cyh0aGlzLmxpc3RDb25maWcpOyAgXG4gIH1cblxuICBzb3J0RGlyZWN0aW9uOiAnYXNjJyB8ICdkZXNjJyB8ICcnID0gJ2FzYyc7XG4gIHN0aWNreSgpIHtcbiAgICBsZXQgaGVhZGVyMT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLm1hdC10b29sYmFyXCIpO1xuICAgIGxldCBoZWFkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm15U2VhcmNoXCIpO1xuICAgIGlmKGhlYWRlcil7XG4gICAgICBsZXQgc3RpY2t5ID0gaGVhZGVyLm9mZnNldFRvcDtcbiAgICAgIGlmICh3aW5kb3cucGFnZVlPZmZzZXQgPiBzdGlja3kpIHtcbiAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5hZGQoXCJzdGlja3lcIik7XG4gICBcbiAgICAgICAgaGVhZGVyMS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoXCJzdGlja3ktaGVhZGVyXCIpO1xuICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoZWFkZXIuY2xhc3NMaXN0LnJlbW92ZShcInN0aWNreVwiKTtcbiAgICAgICAgaGVhZGVyMS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJzdGlja3ktaGVhZGVyXCIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvblNjcm9sbGVkKGV2ZW50KXtcbiAgfVxuXG5cbiAgY29udGVudEZpbHRlckNvbHVtblNwYW46IG51bWJlcjtcbiAgY29sdW1uU2VsZWN0aW9uQ29sdW1uU3BhbjogbnVtYmVyO1xuXG4gIHNldEZpbHRlckJhcigpIHtcbiAgICBpZiAodGhpcy5fbGlzdENvbmZpZy5zdGF0aWNMaXN0Lmhhc09uUGFnZUZpbHRlciAmJiAhdGhpcy5fbGlzdENvbmZpZy5oYXNDb2x1bW5TZWxlY3Rpb24pICB7XG4gICAgICB0aGlzLmNvbnRlbnRGaWx0ZXJDb2x1bW5TcGFuID0gMTI7XG4gICAgfVxuICAgIGlmICghdGhpcy5fbGlzdENvbmZpZy5zdGF0aWNMaXN0Lmhhc09uUGFnZUZpbHRlciAmJiB0aGlzLl9saXN0Q29uZmlnLmhhc0NvbHVtblNlbGVjdGlvbikgIHtcbiAgICAgIHRoaXMuY29sdW1uU2VsZWN0aW9uQ29sdW1uU3BhbiA9IDEyO1xuICAgIH1cbiAgfVxuXG4gIHNldFBhZ2VTaXplKCkge1xuICAgIGlmICh0aGlzLl9saXN0Q29uZmlnLnBhZ2luYXRpb24gPT0gUGFnaW5hdGlvblR5cGUuQUxMKSB7XG4gICAgICB0aGlzLmxpbWl0ID0gdGhpcy5fcmVjb3JkICYmIHRoaXMuX3JlY29yZC5yb3dzID8gdGhpcy5fcmVjb3JkLnJvd3MubGVuZ3RoIDogMTA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9saXN0Q29uZmlnLnBhZ2VTaXplKSB7XG4gICAgICAgIHRoaXMubGltaXQgPSB0aGlzLl9saXN0Q29uZmlnLnBhZ2VTaXplO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldEljb25Qb3NpdGlvbigpIHtcbiAgICB0aGlzLmljb25Qb3NpdGlvbiA9IEZvcm1UaXRsZUljb25Qb3NpdGlvbi5CRUZPUkVfVElUTEU7XG4gICAgaWYgKHRoaXMuX2xpc3RDb25maWcuaGVhZGVyICYmIHRoaXMuX2xpc3RDb25maWcuaGVhZGVyLmljb24gJiYgdGhpcy5fbGlzdENvbmZpZy5oZWFkZXIuaWNvbi5wb3NpdGlvbikge1xuICAgICAgdGhpcy5pY29uUG9zaXRpb24gPSB0aGlzLl9saXN0Q29uZmlnLmhlYWRlci5pY29uLnBvc2l0aW9uO1xuICAgIH1cbiAgfVxuXG4gIGZpbHRlckZpZWxkOiBUZXh0RmllbGQ7XG4gIGdldEZpbHRlckZpZWxkKCk6IFRleHRGaWVsZCB7XG4gICAgdGhpcy5maWx0ZXJGaWVsZCA9IHtcbiAgICAgIGtleTogXCJwYWdlRmlsdGVyXCIsXG4gICAgICBsYWJlbDogXCJGaWx0ZXJcIixcbiAgICAgIHR5cGU6IEZpZWxkVHlwZS5URVhULFxuICAgICAgaWNvbjogXCJzZWFyY2hcIixcbiAgICAgIGFwcGVhcmFuY2U6IEZpZWxkQXBwZWFyYW5jZS5TVEFOREFSRCxcbiAgICAgIGlzUmVhZE9ubHk6IGZhbHNlLFxuICAgICAgZmllbGREaXNwbGF5VHlwZTogRmllbGREaWFwbHlUeXBlLklOTElORSxcbiAgICAgIHBsYWNlaG9sZGVyOiBcIlR5cGUgdG8gZGlzcGxheSBmaWx0ZXJlZCBsaXN0XCIsXG4gICAgICB2YWx1ZTogXCJcIlxuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcy5maWx0ZXJGaWVsZDtcbiAgfVxuXG4gIGNvbHVtblNlbGVjdG9yRmllbGQ6IERyb3Bkb3duRmllbGQ7XG4gIGdldENvbHVtblNlbGVjdG9yRmllbGQoKTogRHJvcGRvd25GaWVsZCB7XG4gICAgdGhpcy5jb2x1bW5TZWxlY3RvckZpZWxkID0gTGlzdFV0aWxzLmdldENvbHVtblNlbGVjdG9yRmllbGQodGhpcy5fbGlzdENvbmZpZyk7XG5cbiAgICByZXR1cm4gdGhpcy5jb2x1bW5TZWxlY3RvckZpZWxkO1xuICB9XG5cbiAgdXBkYXRlQ29sdW1uRGlzcGxheShldmVudDogYW55KSB7XG4gICAgY29uc29sZS5sb2coZXZlbnQpO1xuICAgIGZvciAobGV0IGNvbHVtbiBvZiB0aGlzLl9saXN0Q29uZmlnLmNvbHVtbnMpIHtcbiAgICAgIGlmIChldmVudC52YWx1ZS5pbmRleE9mKExpc3RVdGlscy5nZXRDb2x1bW5LZXkoY29sdW1uKSkgPiAtMSkge1xuICAgICAgICBjb2x1bW4uc2hvdyA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2x1bW4uc2hvdyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2V0Q29sdW1uTmFtZXMoKTtcbiAgICB0aGlzLnNldERldGFpbENvbHVtbkNvdW50KCk7XG4gIH1cblxuICBpbmxpbkVkaXRCdXR0b24oaWRlbnRpZmllcjogc3RyaW5nLCBsYWJlbDogc3RyaW5nLCBpY29uOiBzdHJpbmcpOiBCdXR0b24ge1xuICAgIGxldCBidXR0b25Db25maWc6IEJ1dHRvbiA9IHtcbiAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICB0eXBlOiBCdXR0b25UeXBlLlJBSVNFRCxcbiAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgIGNvbG9yOiBCdXR0b25Db2xvci5QUklNQVJZLFxuICAgICAgc2l6ZTogQnV0dG9uU2l6ZS5TTUFMTCxcbiAgICAgIGljb246IGljb24sXG4gICAgICBvbmx5SWNvbjogZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gYnV0dG9uQ29uZmlnO1xuICB9XG5cbiAgZ2V0Q29sdW1uTGFiZWwoY29sdW1uOiBDb2x1bW4pOiBzdHJpbmcge1xuICAgIHJldHVybiBMaXN0VXRpbHMuZ2V0Q29sdW1uTGFiZWwoY29sdW1uKTtcbiAgfVxuXG4gIGdldENvbHVtbktleShjb2x1bW46IENvbHVtbik6IHN0cmluZyB7XG4gICAgcmV0dXJuIExpc3RVdGlscy5nZXRDb2x1bW5LZXkoY29sdW1uKTtcbiAgfVxuXG4gIHJlc2V0SW5saW5lRWRpdEJ1dHRvbihpZGVudGlmaWVyOiBzdHJpbmcsIGxhYmVsOiBzdHJpbmcsIGljb246IHN0cmluZykge1xuICAgIGZvciAobGV0IGNJbmRleCA9IDA7IGNJbmRleCA8IHRoaXMuY29sdW1uQ29uZmlncy5sZW5ndGg7IGNJbmRleCsrKSB7XG5cbiAgICAgIGlmICghQ29sbGVjdGlvblV0aWxzLmlzRW1wdHkodGhpcy5fbGlzdENvbmZpZy5hY3Rpb25zKSkge1xuICAgICAgICBmb3IgKGxldCBhY3Rpb24gb2YgdGhpcy5fbGlzdENvbmZpZy5hY3Rpb25zKSB7XG4gICAgICAgICAgaWYgKGFjdGlvbi5wZXJtaXNzaW9uID09IG51bGwgfHwgKHRoaXMuYWJpbGl0eS5jYW4oYWN0aW9uLnBlcm1pc3Npb25bJ2FjdGlvbiddLCBhY3Rpb24ucGVybWlzc2lvblsnc3ViamVjdCddKSkpIHtcbiAgICAgICAgICAgIHRoaXMuaGFzRGlzcGxheUFjdGlvbnMgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmhhc0Rpc3BsYXlBY3Rpb25zKSB7XG4gICAgICAgIGZvciAobGV0IGZpZWxkIG9mIHRoaXMuY29sdW1uQ29uZmlnc1tjSW5kZXhdLmZpZWxkcykge1xuICAgICAgICAgIGlmIChGaWVsZFV0aWxzLnJlYWRPbmx5RmllbGQoKS5pbmRleE9mKGZpZWxkLnR5cGUpID4gLTEpIHsgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXNJbmxpbmVFZGl0YWJsZSA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmlubGluZUVkaXRCdXR0b25zID0gbmV3IEFycmF5PEJ1dHRvbj4oKTtcblxuICAgIGlmICh0aGlzLl9yZWNvcmQgJiYgdGhpcy5fcmVjb3JkLnJvd3MpIHtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLl9yZWNvcmQucm93cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgdGhpcy5pbmxpbmVFZGl0QnV0dG9ucy5wdXNoKHRoaXMuaW5saW5FZGl0QnV0dG9uKGlkZW50aWZpZXIsIGxhYmVsLCBpY29uKSk7XG5cbiAgICAgICAgdGhpcy5kaXNwbGF5TW9kZXNbaW5kZXhdID0gRm9ybURpYXBseU1vZGUuVklFVztcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5mb3JtSW5kZXggPSAtMTtcblxuICAgIHRoaXMuc2V0Q29sdW1uTmFtZXMoKTtcbiAgfVxuXG4gIHNob3dSb3dFZGl0YWJsZSgpIHtcbiAgICBpZiAoIUNvbGxlY3Rpb25VdGlscy5pc0VtcHR5KHRoaXMuX2xpc3RDb25maWcuYWN0aW9ucykpIHtcbiAgICAgIHRoaXMuaW5saW5lQnV0dG9uU2l6ZSA9IHRoaXMuX2xpc3RDb25maWcuYWN0aW9uc1swXS5zaXplXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3JlY29yZCAmJiB0aGlzLl9yZWNvcmQucm93cykge1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuX3JlY29yZC5yb3dzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBpZiAodGhpcy5fcmVjb3JkLnJvd3NbaW5kZXhdWydzaG93Um93RWRpdGFibGUnXSkge1xuICAgICAgICAgIHRoaXMuc2V0Um93RWRpdGFibGl0eShpbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRSb3dFZGl0YWJsaXR5KGluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5mb3JtSW5kZXggIT0gLTEgJiYgdGhpcy5mb3JtSW5kZXggIT0gaW5kZXgpIHtcbiAgICAgIHRoaXMuaW5saW5lRWRpdEJ1dHRvbnNbdGhpcy5mb3JtSW5kZXhdLmlkZW50aWZpZXIgPSAnaW5saW5lRWRpdEJ1dHRvbic7XG4gICAgICB0aGlzLmlubGluZUVkaXRCdXR0b25zW3RoaXMuZm9ybUluZGV4XS5sYWJlbCA9ICdFZGl0JztcbiAgICAgIHRoaXMuaW5saW5lRWRpdEJ1dHRvbnNbdGhpcy5mb3JtSW5kZXhdLmljb24gPSAnZWRpdCc7XG4gICAgICB0aGlzLmlubGluZUVkaXRCdXR0b25zW3RoaXMuZm9ybUluZGV4XS5zaXplID0gdGhpcy5pbmxpbmVCdXR0b25TaXplO1xuICAgICAgdGhpcy5mb3JtSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaW5saW5lRWRpdEJ1dHRvbnNbaW5kZXhdLmxhYmVsID09ICdFZGl0Jykge1xuICAgICAgdGhpcy5pbmxpbmVFZGl0QnV0dG9uc1tpbmRleF0uaWRlbnRpZmllciA9ICdjYW5jZWxJbmxpbmVTdGF0aWNMaXN0JztcbiAgICAgIHRoaXMuaW5saW5lRWRpdEJ1dHRvbnNbaW5kZXhdLmxhYmVsID0gJ0NhbmNlbCc7XG4gICAgICB0aGlzLmlubGluZUVkaXRCdXR0b25zW2luZGV4XS5pY29uID0gJ2Nsb3NlJztcbiAgICAgIHRoaXMuaW5saW5lRWRpdEJ1dHRvbnNbaW5kZXhdLnNpemUgPSB0aGlzLmlubGluZUJ1dHRvblNpemU7XG5cbiAgICAgIGlmICh0aGlzLl9yZWNvcmQgJiYgdGhpcy5fcmVjb3JkLnJvd3MpIHtcbiAgICAgICAgZm9yIChsZXQgckluZGV4ID0gMDsgckluZGV4IDwgdGhpcy5fcmVjb3JkLnJvd3MubGVuZ3RoOyBySW5kZXgrKykge1xuICAgICAgICAgIHRoaXMuZGlzcGxheU1vZGVzW3JJbmRleF0gPSBGb3JtRGlhcGx5TW9kZS5WSUVXO1xuXG4gICAgICAgICAgaWYgKHJJbmRleCAhPSBpbmRleCkge1xuICAgICAgICAgICAgdGhpcy5pbmxpbmVFZGl0QnV0dG9uc1tySW5kZXhdLmlkZW50aWZpZXIgPSAnaW5saW5lRWRpdEJ1dHRvbic7XG4gICAgICAgICAgICB0aGlzLmlubGluZUVkaXRCdXR0b25zW3JJbmRleF0ubGFiZWwgPSAnRWRpdCc7XG4gICAgICAgICAgICB0aGlzLmlubGluZUVkaXRCdXR0b25zW3JJbmRleF0uaWNvbiA9ICdlZGl0JztcbiAgICAgICAgICAgIHRoaXMuaW5saW5lRWRpdEJ1dHRvbnNbckluZGV4XS5zaXplID0gdGhpcy5pbmxpbmVCdXR0b25TaXplO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9yZWNvcmQucm93c1tpbmRleF1bJ2Zvcm1EaXNwbGF5TW9kZSddKSB7XG4gICAgICAgICAgdGhpcy5kaXNwbGF5TW9kZXNbaW5kZXhdID0gdGhpcy5fcmVjb3JkLnJvd3NbaW5kZXhdWydmb3JtRGlzcGxheU1vZGUnXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmRpc3BsYXlNb2Rlc1tpbmRleF0gPSBGb3JtRGlhcGx5TW9kZS5FRElUO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5pdEZvcm1Hcm91cChpbmRleCk7XG4gICAgICB0aGlzLmZvcm1JbmRleCA9IGluZGV4O1xuICAgICAgdGhpcy5fbGlzdFJlc2V0ID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaW5saW5lRWRpdEJ1dHRvbnNbaW5kZXhdLmlkZW50aWZpZXIgPSAnaW5saW5lRWRpdEJ1dHRvbic7XG4gICAgICB0aGlzLmlubGluZUVkaXRCdXR0b25zW2luZGV4XS5sYWJlbCA9ICdFZGl0JztcbiAgICAgIHRoaXMuaW5saW5lRWRpdEJ1dHRvbnNbaW5kZXhdLmljb24gPSAnZWRpdCc7XG4gICAgICB0aGlzLmlubGluZUVkaXRCdXR0b25zW2luZGV4XS5zaXplID0gdGhpcy5pbmxpbmVCdXR0b25TaXplO1xuICAgICAgdGhpcy5mb3JtSW5kZXggPSAtMTtcbiAgICB9XG5cbiAgICBsZXQgaW5saW5lQnV0dG9uVGVtcCA9IHRoaXMuaW5saW5lRWRpdEJ1dHRvbnNbaW5kZXhdO1xuICAgIHRoaXMuaW5saW5lRWRpdEJ1dHRvbnNbaW5kZXhdID0gdW5kZWZpbmVkO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5pbmxpbmVFZGl0QnV0dG9uc1tpbmRleF0gPSBpbmxpbmVCdXR0b25UZW1wLCAxMDApO1xuICB9XG5cbiAgcG9wdWxhdGVBbGxDaGlsZHMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3JlY29yZCAmJiB0aGlzLl9yZWNvcmQucm93cyAmJiB0aGlzLl9yZWNvcmQucm93cy5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKGxldCBySW5kZXggPSAwOyBySW5kZXggPCB0aGlzLl9yZWNvcmQucm93cy5sZW5ndGg7IHJJbmRleCsrKSB7XG4gICAgICAgIHRoaXMuY2hpbGRSb3dzW3JJbmRleF0gPSB0aGlzLmdldENoaWxkUm93cyh0aGlzLl9yZWNvcmQucm93c1tySW5kZXhdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRDaGlsZFJvd3Mocm93OiBhbnkpOiBhbnkge1xuICAgIGlmICh0aGlzLl9saXN0Q29uZmlnICYmIHRoaXMuX2xpc3RDb25maWcuY2hpbGQgJiYgcm93KSB7XG4gICAgICBsZXQgZGF0YTogQXJyYXk8YW55PiB8IGFueSA9IHRoaXMuX2xpc3RDb25maWcuY2hpbGQucmVjb3JkSWRlbnRpZmllciA/IHJvd1t0aGlzLl9saXN0Q29uZmlnLmNoaWxkLnJlY29yZElkZW50aWZpZXJdIDogcm93O1xuXG4gICAgICBpZiAodGhpcy5fbGlzdENvbmZpZy5jaGlsZC50eXBlID09IENoaWxkTGlzdFR5cGUuTElTVCkge1xuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgIGxldCBjaGlsZERhdGE6IGFueTtcbiAgICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBjaGlsZERhdGEgPSBkYXRhO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGlsZERhdGEgPSBuZXcgQXJyYXk8YW55PigpO1xuICAgICAgICAgICAgY2hpbGREYXRhLnB1c2goZGF0YSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IHJlY29yZDogUmVjb3JkID0ge1xuICAgICAgICAgICAgcGFnZU5vOiAxLFxuICAgICAgICAgICAgdG90YWw6IGNoaWxkRGF0YS5sZW5ndGgsXG4gICAgICAgICAgICByb3dzOiBjaGlsZERhdGFcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcmV0dXJuIHJlY29yZDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0VmFsdWUoY29sSW5kZXg6IG51bWJlciwgY0ZpZWxkSW5kZXg6IG51bWJlciwgcm93OiBhbnksIHZhbHVlOiBhbnkpOiBhbnkge1xuICAgIHRyeSB7XG4gICAgICB2YWx1ZSA9IGV2YWwoXCJyb3cuXCIgKyB0aGlzLmNvbHVtbkNvbmZpZ3NbY29sSW5kZXhdLmZpZWxkc1tjRmllbGRJbmRleF0ua2V5KTtcbiAgICB9IGNhdGNoIChlKSB7IH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIHVwZGF0ZUZpbHRlcihmaWVsZCkge1xuICAgIGNvbnN0IGZpbHRlclZhbHVlID0gZmllbGQudmFsdWU7XG4gICAgdGhpcy5kYXRhU291cmNlLmZpbHRlciA9IGZpbHRlclZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgaWYgKHRoaXMuZGF0YVNvdXJjZS5wYWdpbmF0b3IpIHtcbiAgICAgIHRoaXMuZGF0YVNvdXJjZS5wYWdpbmF0b3IuZmlyc3RQYWdlKCk7XG4gICAgfVxuICB9XG5cbiAgaW5pdEZvcm1Hcm91cChjbnQ6IG51bWJlcik6IHZvaWQge1xuICAgIGxldCBmaWVsZENvbnRyb2xzID0ge307XG5cbiAgICBsZXQgcm93ID0gdGhpcy5nZXRDdXJyZW50UmVjb3JkKGNudCk7XG5cbiAgICBLZXlNYXBVdGlscy5zZXRPcHRpb25zc1VzaW5nVmFsdWVzKHRoaXMua2V5TWFwLCBmYWxzZSwgS2V5TWFwT3B0aW9uVHlwZS5MSVNULCB0aGlzLl9saXN0Q29uZmlnLCByb3cpO1xuXG4gICAgZm9yIChsZXQgY29sdW1uIG9mIHRoaXMuY29sdW1uQ29uZmlncykge1xuICAgICAgZm9yIChsZXQgZmllbGQgb2YgY29sdW1uLmZpZWxkcykge1xuICAgICAgICBsZXQgZm9ybUZpZWxkOiBGb3JtRmllbGQgPSB7IGZpZWxkOiBmaWVsZCwgYWRkTW9yZTogZmFsc2UgfTtcblxuICAgICAgICBpZiAodGhpcy5fbGlzdENvbmZpZy51bmlxdWVLZXlzLmluZGV4T2YoZm9ybUZpZWxkLmZpZWxkLmtleSkgPiAtMSkge1xuICAgICAgICAgIGZvcm1GaWVsZC5maWVsZC5pc1VuaXF1ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgRm9ybVV0aWxzLmluaXRGaWVsZEdyb3VwKGZpZWxkQ29udHJvbHMsIGZvcm1GaWVsZCwgbnVsbCwgcm93LCB0aGlzLmRpc3BsYXlNb2Rlc1tjbnRdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmZvcm0gPSBuZXcgRm9ybUdyb3VwKGZpZWxkQ29udHJvbHMpO1xuICAgIHRoaXMuZm9ybUluZGV4ID0gY250O1xuICB9XG5cbiAgaW5pdENvbW1vbkZvcm1Hcm91cCgpOiB2b2lkIHtcbiAgICBsZXQgY29tbW9uRmllbGRDb250cm9scyA9IHt9O1xuXG4gICAgRm9ybVV0aWxzLmluaXRGaWVsZEdyb3VwKGNvbW1vbkZpZWxkQ29udHJvbHMsIHsgZmllbGQ6IHRoaXMuZ2V0RmlsdGVyRmllbGQoKSwgYWRkTW9yZTogZmFsc2UgfSwge30sIHt9LCBGb3JtRGlhcGx5TW9kZS5FRElUKTtcbiAgICBGb3JtVXRpbHMuaW5pdEZpZWxkR3JvdXAoY29tbW9uRmllbGRDb250cm9scywgeyBmaWVsZDogdGhpcy5nZXRDb2x1bW5TZWxlY3RvckZpZWxkKCksIGFkZE1vcmU6IGZhbHNlIH0sIHt9LCB7fSwgRm9ybURpYXBseU1vZGUuRURJVCk7XG5cbiAgICB0aGlzLmNvbW1vbkxpc3RGb3JtID0gbmV3IEZvcm1Hcm91cChjb21tb25GaWVsZENvbnRyb2xzKTtcbiAgfVxuXG4gIGdldEN1cnJlbnRSZWNvcmQoY250OiBudW1iZXIpOiBhbnkge1xuICAgIGxldCByZWNvcmQ6IGFueSA9IHt9O1xuXG4gICAgaWYgKHRoaXMuZGF0YVNvdXJjZSAmJiB0aGlzLmRhdGFTb3VyY2VbJ19yZW5kZXJEYXRhJ10gJiYgdGhpcy5kYXRhU291cmNlWydfcmVuZGVyRGF0YSddWydfdmFsdWUnXSAmJiB0aGlzLmRhdGFTb3VyY2VbJ19yZW5kZXJEYXRhJ11bJ192YWx1ZSddW2NudF0pIHtcbiAgICAgIHJlY29yZCA9IHRoaXMuZGF0YVNvdXJjZVsnX3JlbmRlckRhdGEnXVsnX3ZhbHVlJ11bY250XTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3JlY29yZCAmJiB0aGlzLl9yZWNvcmRbJ3Jvd3MnXSAmJiB0aGlzLl9yZWNvcmRbJ3Jvd3MnXVtjbnRdKSB7XG4gICAgICByZWNvcmQgPSB0aGlzLl9yZWNvcmRbJ3Jvd3MnXVtjbnRdO1xuICAgIH1cblxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICBnZXRPYmplY3RUcmVlKGN1cnJlbnRSb3c6IGFueSk6IE9iamVjdFRyZWUge1xuICAgIGlmICh0aGlzLl9saXN0Q29uZmlnICYmIHRoaXMuX2xpc3RDb25maWcudW5pcXVlS2V5cyAmJiB0aGlzLl9saXN0Q29uZmlnLnVuaXF1ZUtleXMubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IGtleXMgPSB0aGlzLl9saXN0Q29uZmlnLnVuaXF1ZUtleXM7XG5cbiAgICAgIGxldCB2YWx1ZXM6IEFycmF5PHN0cmluZz4gPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xuICAgICAga2V5cy5mb3JFYWNoKGtleSA9PiB2YWx1ZXMucHVzaChjdXJyZW50Um93W2tleV0pKTtcblxuICAgICAgbGV0IG9iamVjdFRyZWU6IE9iamVjdFRyZWUgPSB7XG4gICAgICAgIHBhcmVudDoge1xuICAgICAgICAgIGtleTogdmFsdWVzXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgICBvYmplY3RUcmVlLmhpZXJhcmNoeVVwID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnBhcmVudCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9iamVjdFRyZWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBudW1iZXIgb2Ygc2VsZWN0ZWQgZWxlbWVudHMgbWF0Y2hlcyB0aGUgdG90YWwgbnVtYmVyIG9mIHJvd3MuICovXG4gIGlzQWxsU2VsZWN0ZWQoKSB7XG4gICAgY29uc3QgbnVtU2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGlvbi5zZWxlY3RlZC5sZW5ndGg7XG4gICAgY29uc3QgbnVtUm93cyA9IHRoaXMuZGF0YVNvdXJjZS5kYXRhLmxlbmd0aDtcbiAgICByZXR1cm4gbnVtU2VsZWN0ZWQgPT09IG51bVJvd3M7XG4gIH1cblxuICAvKiogU2VsZWN0cyBhbGwgcm93cyBpZiB0aGV5IGFyZSBub3QgYWxsIHNlbGVjdGVkOyBvdGhlcndpc2UgY2xlYXIgc2VsZWN0aW9uLiAqL1xuICBtYXN0ZXJUb2dnbGUoKSB7XG4gICAgdGhpcy5pc0FsbFNlbGVjdGVkKCkgP1xuICAgICAgdGhpcy5zZWxlY3Rpb24uY2xlYXIoKSA6XG4gICAgICB0aGlzLmRhdGFTb3VyY2UuZGF0YS5mb3JFYWNoKHJvdyA9PiB0aGlzLnNlbGVjdGlvbi5zZWxlY3Qocm93KSk7XG4gIH1cblxuICAvKiogVGhlIGxhYmVsIGZvciB0aGUgY2hlY2tib3ggb24gdGhlIHBhc3NlZCByb3cgKi9cbiAgY2hlY2tib3hMYWJlbChyb3c/OiBhbnkpOiBzdHJpbmcge1xuICAgIGlmICghcm93KSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5pc0FsbFNlbGVjdGVkKCkgPyAnc2VsZWN0JyA6ICdkZXNlbGVjdCd9IGFsbGA7XG4gICAgfVxuICAgIHJldHVybiBgJHt0aGlzLnNlbGVjdGlvbi5pc1NlbGVjdGVkKHJvdykgPyAnZGVzZWxlY3QnIDogJ3NlbGVjdCd9IHJvdyAke3Jvdy5wb3NpdGlvbiArIDF9YDtcbiAgfVxuXG4gIHNldENhcmRWaXNpYmlsaXR5KCk6IHZvaWQge1xuICAgIHRoaXMuaGlkZUNhcmQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fbGlzdENvbmZpZy5oaWRlQ2FyZCB8fCAodGhpcy5fbGlzdENvbmZpZy5oaWRlSGVhZGVyICYmIHRoaXMuX2xpc3RDb25maWcuaGlkZUZvb3RlcikpIHtcbiAgICAgIHRoaXMuaGlkZUNhcmQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhpZGVDYXJkID09IGZhbHNlKSB7XG4gICAgICBpZiAodGhpcy5fcmVjb3JkICYmIHRoaXMuX3JlY29yZC5yb3dzICYmIHRoaXMuX3JlY29yZC5yb3dzLmxlbmd0aCA9PSB0aGlzLl9yZWNvcmQudG90YWwgJiYgKFN0cmluZ1V0aWxzLmlzRW1wdHkodGhpcy5fbGlzdENvbmZpZy5oZWFkZXIpICYmIHRoaXMuX2xpc3RDb25maWcuZGVzY3JpcHRpb24pKSB7XG4gICAgICAgIHRoaXMuaGlkZUNhcmQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaGlkZUhlYWRlciA9IGZhbHNlO1xuICAgIGlmICgoIXRoaXMuX2xpc3RDb25maWcuaGVhZGVyIHx8IFN0cmluZ1V0aWxzLmlzRW1wdHkodGhpcy5fbGlzdENvbmZpZy5oZWFkZXIudGl0bGUpKSAmJiBTdHJpbmdVdGlscy5pc0VtcHR5KHRoaXMuX2xpc3RDb25maWcuZGVzY3JpcHRpb24pIHx8IHRoaXMuX2xpc3RDb25maWcuaGlkZUhlYWRlcikge1xuICAgICAgdGhpcy5oaWRlSGVhZGVyID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLmhpZGVGb290ZXIgPSBmYWxzZTtcbiAgICBpZiAoKHRoaXMuX3JlY29yZCAmJiB0aGlzLl9yZWNvcmQucm93cyAmJiB0aGlzLl9yZWNvcmQucm93cy5sZW5ndGggPT0gdGhpcy5fcmVjb3JkLnRvdGFsKSB8fCB0aGlzLl9saXN0Q29uZmlnLmhpZGVGb290ZXIpIHtcbiAgICAgIHRoaXMuaGlkZUZvb3RlciA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgc2V0Q29sdW1uTmFtZXMoKTogdm9pZCB7XG4gICAgdGhpcy5jb2x1bW5OYW1lcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XG4gICAgdGhpcy5jb2x1bW5Db25maWdzID0gbmV3IEFycmF5PENvbHVtbj4oKTtcblxuICAgIHRoaXMudG90YWxEaXNwYWx5YWJsZVdpZHRoID0gMDtcblxuICAgIGlmICh0aGlzLl9saXN0Q29uZmlnLnNlbGVjdGFibGUpIHtcbiAgICAgIHRoaXMuY29sdW1uTmFtZXMucHVzaCgnc2VsZWN0Jyk7XG5cbiAgICAgIGlmICghdGhpcy5fbGlzdENvbmZpZy5oZWFkZXIpIHtcbiAgICAgICAgdGhpcy5fbGlzdENvbmZpZy5oZWFkZXIgPSB7IHRpdGxlOiBcIlwiIH07XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5fbGlzdENvbmZpZy5oZWFkZXIgfHwgQ29sbGVjdGlvblV0aWxzLmlzRW1wdHkodGhpcy5fbGlzdENvbmZpZy5oZWFkZXIuYWN0aW9ucykpIHtcbiAgICAgICAgdGhpcy5fbGlzdENvbmZpZy5oZWFkZXIuYWN0aW9ucyA9IG5ldyBBcnJheTxCdXR0b24+KCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBzZWxlY3RhYmxlRXhpc3QgPSBmYWxzZTtcbiAgICAgIGZvciAobGV0IGJ1dHRvbiBvZiB0aGlzLl9saXN0Q29uZmlnLmhlYWRlci5hY3Rpb25zKSB7XG4gICAgICAgIGlmICgoPEJ1dHRvbj5idXR0b24pLmlkZW50aWZpZXIgPT0gXCJsaXN0Q3J1ZFNlbGVjdGlvbkJ1dHRvblwiKSB7XG4gICAgICAgICAgc2VsZWN0YWJsZUV4aXN0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXNlbGVjdGFibGVFeGlzdCkge1xuICAgICAgICB0aGlzLl9saXN0Q29uZmlnLmhlYWRlci5hY3Rpb25zLnVuc2hpZnQodGhpcy5zZWxlY3RhYmxlQnV0dG9uKFwibGlzdENydWRTZWxlY3Rpb25CdXR0b25cIiwgdGhpcy5fbGlzdENvbmZpZy5zZWxlY3RhYmxlLmxhYmVsLCB0aGlzLl9saXN0Q29uZmlnLnNlbGVjdGFibGUuaWNvbikpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2xpc3RDb25maWcuY29sdW1ucyAmJiB0aGlzLl9saXN0Q29uZmlnLmNvbHVtbnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fbGlzdENvbmZpZy5jb2x1bW5zLmZpbHRlcihjb2x1bW4gPT4gY29sdW1uLnNob3cgPT0gdHJ1ZSkuZm9yRWFjaChjb2x1bW4gPT4ge1xuICAgICAgICBsZXQgaGFzRGlzcGxheWFibGVGaWVsZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKGxldCBmaWVsZCBvZiBjb2x1bW4uZmllbGRzKSB7XG4gICAgICAgICAgaWYgKGZpZWxkLnBlcm1pc3Npb24gPT0gbnVsbCB8fCB0aGlzLmFiaWxpdHkuY2FuKGZpZWxkLnBlcm1pc3Npb25bJ2FjdGlvbiddLCBmaWVsZC5wZXJtaXNzaW9uWydzdWJqZWN0J10pKSB7XG4gICAgICAgICAgICBoYXNEaXNwbGF5YWJsZUZpZWxkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzRGlzcGxheWFibGVGaWVsZCkge1xuICAgICAgICAgIHRoaXMuY29sdW1uTmFtZXMucHVzaChMaXN0VXRpbHMuZ2V0Q29sdW1uS2V5KGNvbHVtbikpO1xuICAgICAgICAgIHRoaXMuY29sdW1uQ29uZmlncy5wdXNoKGNvbHVtbik7XG5cbiAgICAgICAgICB0aGlzLnRvdGFsRGlzcGFseWFibGVXaWR0aCArPSBjb2x1bW4ud2lkdGg7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhhc0Rpc3BsYXlBY3Rpb25zKSB7XG4gICAgICB0aGlzLmNvbHVtbk5hbWVzLnB1c2goJ2FjdGlvbicpO1xuXG4gICAgICB0aGlzLnRvdGFsRGlzcGFseWFibGVXaWR0aCArPSB0aGlzLl9saXN0Q29uZmlnLmFjdGlvbldpZHRoO1xuICAgIH1cbiAgfVxuXG4gIHNldERldGFpbENvbHVtbkNvdW50KCk6IHZvaWQge1xuICAgIHRoaXMuY2hpbGRDb2x1bW5Db3VudCA9IHRoaXMuY29sdW1uQ29uZmlncy5sZW5ndGggKyAodGhpcy5fbGlzdENvbmZpZy5hY3Rpb25zICYmIHRoaXMuX2xpc3RDb25maWcuYWN0aW9ucy5sZW5ndGggPiAwID8gMSA6IDApICsgKHRoaXMuX2xpc3RDb25maWcuc2VsZWN0YWJsZSA/IDEgOiAwKTtcbiAgfVxuXG4gIHNldENvbG9ycygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcmVjb3JkICYmIHRoaXMuX3JlY29yZC5yb3dzKSB7XG4gICAgICBmb3IgKGxldCBySW5kZXggPSAwOyBySW5kZXggPCB0aGlzLl9yZWNvcmQucm93cy5sZW5ndGg7IHJJbmRleCsrKSB7XG4gICAgICAgIGlmIChDb2xsZWN0aW9uVXRpbHMuaXNFbXB0eSh0aGlzLnJvd0NvbG9yc1tySW5kZXhdKSkge1xuICAgICAgICAgIHRoaXMucm93Q29sb3JzLnB1c2goeyBiZ0NvbG9yOiBcIlwiLCB0ZXh0Q29sb3I6IFwiXCIgfSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJvd0NvbG9yOiBDZWxsQ29sb3IgPSB0aGlzLnJvd0NvbG9yc1tySW5kZXhdO1xuICAgICAgICBpZiAodGhpcy5fbGlzdENvbmZpZy5yb3dCZ0NvbG9yKSB7XG4gICAgICAgICAgcm93Q29sb3IuYmdDb2xvciA9IHRoaXMuX2xpc3RDb25maWcucm93QmdDb2xvcih0aGlzLl9yZWNvcmQucm93c1tySW5kZXhdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fbGlzdENvbmZpZy5yb3dUZXh0Q29sb3IpIHtcbiAgICAgICAgICByb3dDb2xvci50ZXh0Q29sb3IgPSB0aGlzLl9saXN0Q29uZmlnLnJvd1RleHRDb2xvcih0aGlzLl9yZWNvcmQucm93c1tySW5kZXhdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGNJbmRleCA9IDA7IGNJbmRleCA8IHRoaXMuY29sdW1uQ29uZmlncy5sZW5ndGg7IGNJbmRleCsrKSB7XG4gICAgICAgICAgaWYgKENvbGxlY3Rpb25VdGlscy5pc0VtcHR5KHRoaXMuY2VsbENvbG9yc1tySW5kZXhdKSkge1xuICAgICAgICAgICAgdGhpcy5jZWxsQ29sb3JzLnB1c2gobmV3IEFycmF5PENlbGxDb2xvcj4oKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChDb2xsZWN0aW9uVXRpbHMuaXNFbXB0eSh0aGlzLmNlbGxDb2xvcnNbckluZGV4XVtjSW5kZXhdKSkge1xuICAgICAgICAgICAgdGhpcy5jZWxsQ29sb3JzW3JJbmRleF1bY0luZGV4XSA9IHsgYmdDb2xvcjogXCJcIiwgdGV4dENvbG9yOiBcIlwiIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IGNlbGxDb2xvcjogQ2VsbENvbG9yID0gdGhpcy5jZWxsQ29sb3JzW3JJbmRleF1bY0luZGV4XTtcbiAgICAgICAgICBpZiAoU3RyaW5nVXRpbHMuaXNFbXB0eShjZWxsQ29sb3IuYmdDb2xvcikpIHtcbiAgICAgICAgICAgIGNlbGxDb2xvci5iZ0NvbG9yID0gcm93Q29sb3IuYmdDb2xvcjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuY29sdW1uQ29uZmlnc1tjSW5kZXhdLmJnQ29sb3IpIHtcbiAgICAgICAgICAgIGNlbGxDb2xvci5iZ0NvbG9yID0gdGhpcy5jb2x1bW5Db25maWdzW2NJbmRleF0uYmdDb2xvcih0aGlzLl9yZWNvcmQucm93c1tySW5kZXhdKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoU3RyaW5nVXRpbHMuaXNFbXB0eShjZWxsQ29sb3IudGV4dENvbG9yKSkge1xuICAgICAgICAgICAgY2VsbENvbG9yLnRleHRDb2xvciA9IHJvd0NvbG9yLnRleHRDb2xvcjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuY29sdW1uQ29uZmlnc1tjSW5kZXhdLnRleHRDb2xvcikge1xuICAgICAgICAgICAgY2VsbENvbG9yLnRleHRDb2xvciA9IHRoaXMuY29sdW1uQ29uZmlnc1tjSW5kZXhdLnRleHRDb2xvcih0aGlzLl9yZWNvcmQucm93c1tySW5kZXhdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZWxlY3RhYmxlQnV0dG9uKGlkZW50aWZpZXI6IHN0cmluZywgbGFiZWw6IHN0cmluZywgaWNvbjogc3RyaW5nKTogQnV0dG9uIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgIGNvbG9yOiBCdXR0b25Db2xvci5QUklNQVJZLFxuICAgICAgc2l6ZTogQnV0dG9uU2l6ZS5TTUFMTCxcbiAgICAgIGljb246IGljb24sXG4gICAgICB0eXBlOiBCdXR0b25UeXBlLkZMQVQsXG4gICAgICBvbmx5SWNvbjogZmFsc2VcbiAgICB9O1xuICB9XG5cbiAgZmllbGRDaGFuZ2UoZmllbGRDaGFuZ2U6IEZpZWxkQ2hhbmdlKSB7XG4gICAgY29uc29sZS5sb2coZmllbGRDaGFuZ2UpO1xuXG4gICAgdGhpcy5vbkZpZWxkQ2hhbmdlLmVtaXQoZmllbGRDaGFuZ2UpO1xuICAgIHRoaXMuZm9ybUNoYW5nZSh0aGlzLmZvcm0pO1xuXG4gICAgLy8gIGlmIGEgZmllbGQgb3B0aW9ucyBhcmUgZGVwZW5kZW50IG9uIG1lLCB0aGVuIHJlbG9hZCBpdHMgb3B0aW9ucyBcbiAgICBmaWVsZENoYW5nZS5maWVsZEtleTtcbiAgICB0aGlzLl9saXN0Q29uZmlnLmNvbHVtbnMuZm9yRWFjaChjb2x1bW4gPT4ge1xuICAgICAgY29sdW1uLmZpZWxkcy5mb3JFYWNoKGZpZWxkID0+IHtcbiAgICAgICAgaWYgKCg8QXV0b2NvbXBsZXRlRmllbGQgfCBSYWRpb0ZpZWxkIHwgQ2hlY2tib3hGaWVsZCB8IERyb3Bkb3duRmllbGQ+ZmllbGQpLm9wdGlvbkRlcGVuZHNPbiA9PSBmaWVsZENoYW5nZS5maWVsZEtleSkge1xuICAgICAgICAgIGxldCByb3cgPSBGb3JtVXRpbHMuZ2V0UmF3VmFsdWUodGhpcy5mb3JtKTtcbiAgICAgICAgICAvL2xldCByb3cgPSB0aGlzLmdldEN1cnJlbnRSZWNvcmQoZmllbGRDaGFuZ2Uuc291cmNlSW5kZXgpO1xuICAgICAgICAgIEtleU1hcFV0aWxzLnNldE9wdGlvbnNzVXNpbmdWYWx1ZXModGhpcy5rZXlNYXAsIGZhbHNlLCBLZXlNYXBPcHRpb25UeXBlLkxJU1QsIHRoaXMuX2xpc3RDb25maWcsIHJvdyk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGZvcm1DaGFuZ2UoZm9ybTogRm9ybUdyb3VwKSB7XG4gICAgY29uc29sZS5sb2coZm9ybSk7XG5cbiAgICBpZiAoZm9ybSA9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMub25Gb3JtQ2hhbmdlLmVtaXQodGhpcy5mb3JtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbkZvcm1DaGFuZ2UuZW1pdChmb3JtKTtcbiAgICB9XG4gIH1cblxuICBidXR0b25DbGljayhhY3Rpb246IEFjdGlvbikge1xuICAgIGNvbnNvbGUubG9nKGFjdGlvbik7XG5cbiAgICBpZiAoYWN0aW9uLmFjdGlvbiA9PSAnbGlzdENydWRTZWxlY3Rpb25CdXR0b24nKSB7XG4gICAgICBhY3Rpb24uZGF0YSA9IHRoaXMuc2VsZWN0aW9uLnNlbGVjdGVkO1xuICAgIH1cblxuICAgIGlmIChhY3Rpb24uYWN0aW9uID09IFJlc2VydmVkQnV0dG9uLlJPV19FWFBBTkQgfHwgYWN0aW9uLmFjdGlvbiA9PSBSZXNlcnZlZEJ1dHRvbi5ST1dfQ09MTEFQU0UpIHtcbiAgICB9IGVsc2Uge1xuICAgICAgYWN0aW9uLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIHRoaXMub25CdXR0b25DbGljay5lbWl0KGFjdGlvbik7XG4gIH1cblxuICBnZXRMYXlvdXQoKTogdm9pZCB7XG4gICAgdGhpcy5icmVha3BvaW50U3Vic2NyaXB0aW9uID0gdGhpcy5icmVha3BvaW50T2JzZXJ2ZXIub2JzZXJ2ZShbXG4gICAgICBCcmVha3BvaW50cy5YU21hbGwsXG4gICAgICBCcmVha3BvaW50cy5TbWFsbCxcbiAgICAgIEJyZWFrcG9pbnRzLk1lZGl1bSxcbiAgICAgIEJyZWFrcG9pbnRzLkxhcmdlLFxuICAgICAgQnJlYWtwb2ludHMuWExhcmdlXG4gICAgXSkuc3Vic2NyaWJlKChzdGF0ZTogQnJlYWtwb2ludFN0YXRlKSA9PiB7XG4gICAgICBpZiAoc3RhdGUuYnJlYWtwb2ludHNbQnJlYWtwb2ludHMuWFNtYWxsXSkge1xuICAgICAgICB0aGlzLmlzTW9iaWxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jZWxsQ291bnQgPSB0aGlzLmxpc3RDb25maWcubW9iaWxlICYmIHRoaXMubGlzdENvbmZpZy5tb2JpbGUuY2VsbENvdW50ID8gdGhpcy5saXN0Q29uZmlnLm1vYmlsZS5jZWxsQ291bnQgOiA0O1xuICAgICAgICB0aGlzLmhpZGVDYXJkID0gdHJ1ZTtcbiAgICAgICAgTGlzdFV0aWxzLmdldE1vYmlsZUNvbmZpZyh0aGlzLmxpc3RDb25maWcpOyAgXG5cbiAgICAgICAgY29uc29sZS5sb2coJ01hdGNoZXMgWFNtYWxsIHZpZXdwb3J0Jyk7XG4gICAgICB9XG4gICAgICBpZiAoc3RhdGUuYnJlYWtwb2ludHNbQnJlYWtwb2ludHMuU21hbGxdKSB7XG4gICAgICAgIHRoaXMuaXNUYWJsZXQgPSB0cnVlO1xuICAgICAgICBjb25zb2xlLmxvZygnTWF0Y2hlcyBTbWFsbCB2aWV3cG9ydCcpO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXRlLmJyZWFrcG9pbnRzW0JyZWFrcG9pbnRzLk1lZGl1bV0pIHtcbiAgICAgICAgdGhpcy5pc0Rlc2t0b3AgPSB0cnVlO1xuICAgICAgICBjb25zb2xlLmxvZygnTWF0Y2hlcyBNZWRpdW0gIHZpZXdwb3J0Jyk7XG4gICAgICB9XG4gICAgICBpZiAoc3RhdGUuYnJlYWtwb2ludHNbQnJlYWtwb2ludHMuTGFyZ2VdKSB7XG4gICAgICAgIHRoaXMuaXNEZXNrdG9wID0gdHJ1ZTtcbiAgICAgICAgY29uc29sZS5sb2coJ01hdGNoZXMgTGFyZ2Ugdmlld3BvcnQnKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZS5icmVha3BvaW50c1tCcmVha3BvaW50cy5YTGFyZ2VdKSB7XG4gICAgICAgIHRoaXMuaXNEZXNrdG9wID0gdHJ1ZTtcbiAgICAgICAgY29uc29sZS5sb2coJ01hdGNoZXMgWExhcmdlIHZpZXdwb3J0Jyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVzZXRWZXJ0aWNhbERpc3BsYXkoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJvd0NsaWNrKHJvdzogYW55LCByb3dJbmRleDogYW55LCBjb250ZXh0OiBhbnksIGV2ZW50OiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhyb3cpO1xuICAgIGNvbnNvbGUubG9nKHJvd0luZGV4KTtcbiAgICBjb25zb2xlLmxvZyhjb250ZXh0KTtcblxuICAgIGxldCBhY3Rpb25CdXR0b246IEJ1dHRvbiA9IG51bGw7XG4gICAgaWYgKCFDb2xsZWN0aW9uVXRpbHMuaXNFbXB0eSh0aGlzLl9saXN0Q29uZmlnLmFjdGlvbnMpKSB7XG4gICAgICB0aGlzLl9saXN0Q29uZmlnLmFjdGlvbnMuZm9yRWFjaChhY3Rpb24gPT4ge1xuICAgICAgICBpZiAoYWN0aW9uLmlkZW50aWZpZXIgPT0gdGhpcy5fbGlzdENvbmZpZy5yb3dBY3Rpb24pIHtcbiAgICAgICAgICBhY3Rpb25CdXR0b24gPSBhY3Rpb247XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGlmIChhY3Rpb25CdXR0b24gIT0gbnVsbCkge1xuICAgICAgICBsZXQgYWN0aW9uT2JqOiBBY3Rpb24gPSBCdXR0b25VdGlscy5nZXRBY3Rpb24oXG4gICAgICAgICAgdGhpcy5fbGlzdENvbmZpZy5pZGVudGlmaWVyLFxuICAgICAgICAgIHJvd0luZGV4LFxuICAgICAgICAgIHRoaXMud2lkZ2V0QXJyYXlJbmRleCxcbiAgICAgICAgICBhY3Rpb25CdXR0b24uaWRlbnRpZmllcixcbiAgICAgICAgICB0aGlzLnBhcmVudCxcbiAgICAgICAgICBldmVudCxcbiAgICAgICAgICByb3csXG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBudWxsKTtcblxuICAgICAgICB0aGlzLm9uQnV0dG9uQ2xpY2suZW1pdChhY3Rpb25PYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlc2V0VmVydGljYWxEaXNwbGF5KCk6IHZvaWQge1xuICAgIC8vIGlmICh0aGlzLl9saXN0Q29uZmlnLm1vYmlsZSAmJiB0aGlzLl9saXN0Q29uZmlnLm1vYmlsZS5kaXNwbGF5VmVydGljYWwgJiYgdGhpcy5pc01vYmlsZSkge1xuICAgIC8vICAgdGhpcy5kaXNwbGF5VmVydGljYWwgPSB0cnVlO1xuICAgIC8vIH1cbiAgfVxuXG4gIGdldEJ1dHRvbihjZWxsOiBDdXN0b21MYXlvdXRDZWxsKSB7XG4gICAgbGV0IGJ1dHRvbnM6IEFycmF5PENlbGxDb250cm9sPiA9IG5ldyBBcnJheTxDZWxsQ29udHJvbD4oKTtcbiAgICBpZiAoIUNvbGxlY3Rpb25VdGlscy5pc0VtcHR5KGNlbGwpICYmICFDb2xsZWN0aW9uVXRpbHMuaXNFbXB0eShjZWxsLmNvbnRyb2xzKSkge1xuICAgICAgYnV0dG9ucyA9IGNlbGwuY29udHJvbHMuZmlsdGVyKGNvbnRyb2wgPT4gY29udHJvbC50eXBlID09IENlbGxDb250cm9sbFR5cGUuQlVUVE9OKS5tYXAoY29udHJvbCA9PiBjb250cm9sLmNvbnRyb2wpO1xuICAgIH1cblxuICAgIHJldHVybiBidXR0b25zO1xuICB9XG5cbiAgb25Ib3ZlcihldmVudCwgcm93SW5kZXgsIHJvdykge1xuICAgIHRoaXMuaG92ZXJSb3dEYXRhID0gcm93O1xuICAgIHRoaXMuaG92ZXJSb3dJbmRleCA9IHJvd0luZGV4O1xuICB9XG5cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5icmVha3BvaW50U3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLmJyZWFrcG9pbnRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
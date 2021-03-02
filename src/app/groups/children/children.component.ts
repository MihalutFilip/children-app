import { Component, OnInit, Input, ViewChild, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Child } from 'src/app/domains/Child';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Group } from 'src/app/domains/Group';
import { ConfirmationDialogService } from 'src/app/modals/confirmation-dialog/confirmation-dialog.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-children',
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.scss'],
  providers: [MessageService]
})
export class ChildrenComponent implements OnInit {
  @Input() children: Child[];
  @Input() group: Group;
  @ViewChild(MatPaginator,{static: false}) paginator: MatPaginator;
  @Output() onChildAdded: EventEmitter<Child> = new EventEmitter();
  @Output() onChildDeleted: EventEmitter<Child> = new EventEmitter();
  @Output() onChildrenChanges: EventEmitter<any> = new EventEmitter();
  displayedColumns: string[];
  displayedCustomFields: string[];
  childrenTable: MatTableDataSource<Child>;
  isChildModalOpen: boolean = false;
  currentChild: Child;

  constructor(private confirmationDialogService: ConfirmationDialogService, private toastService: MessageService) { }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['children'])
      this.children = changes['children'].currentValue;
    if(changes['group'])
      this.group = changes['group'].currentValue;
    this.initializeTable(); 
  }

  ngOnInit() {
    this.initializeTable();
  }

  initializeTable() {
    //Set Columns
    let customFields = this.group.customFields;
    this.displayedCustomFields = [].concat(...customFields.map(customField => customField.name));
    this.displayedColumns = ['icon','name'].concat(...customFields.map(customField => customField.name)).concat(['total','edit','delete']); 

    //Set MatTable
    this.childrenTable = new MatTableDataSource<Child>(this.children);   
    setTimeout(() => this.childrenTable.paginator = this.paginator);
  }

  addChild() {
    this.currentChild = new Child();
    this.isChildModalOpen = true;
  }

  editChild(child: Child) {
    this.currentChild = {...child};
    this.isChildModalOpen = true;
  }

  onSave(child) {
    if(!child) {
      this.isChildModalOpen = false;
      return;
    }

    if(child.id) { 
      let childIndex = this.children.findIndex(g => g.id == child.id);
      this.children[childIndex] = {...child};
    }
    else {
      child.groupId = this.group.id;
      child.sumOfMarks = 0;
      child.marks = this.group.customFields.map(customField => <any>{customField: customField, value: 0});
      console.log(child.marks);
      this.isChildModalOpen = false;
      this.onChildAdded.emit(child);
      this.children.push(child);
    }
    this.initializeTable();

    this.onChildrenChanges.emit();
  }

  deleteChild(child: Child) {
    this.confirmationDialogService.confirm('Confirmare', 'Esti sigur ca vrei sa stergi acest copil?').then((confirmed) => 
    {
      if(confirmed)
      {
        this.children.splice(this.children.indexOf(child), 1);
        this.onChildDeleted.emit(child);
        this.toastService.add({severity:'success', summary:'Info', detail:'Copilul a fost sters cu succes'});
        this.initializeTable();
      }
    });

    this.onChildrenChanges.emit();
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

interface FieldConfig {
  type: string;
  validators?: any[];
}

@Component({
  selector: 'app-dynamic-form-dialog',
  imports: [
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './dynamic-form-dialog.html',
  styleUrl: './dynamic-form-dialog.css'
})
export class DynamicFormDialog implements OnInit, AfterViewInit {

  form!: FormGroup;
  keys: string[] = [];
  levelOptions = [1, 2, 3, 4, 5];
  labelMap: Record<string, string> = {};
  selectOptions: Record<string, any[]> = {};
  fileFields: string[] = [];
  fileNames: Record<string, string> = {};
  readonlyFields: string[] = [];
  passwordVisible: boolean = false;
  companys: { id: string, name: string }[] = [];
  fieldConfig: Record<string, FieldConfig> = {};

  // Para metaCampos sólo para MetaTabla
  metaCampos: any[] = [];
  metaCampoForm!: FormGroup;
  tiposCampo = [
    'STRING',
    'TEXT',
    'BOOLEAN',
    'INTEGER',
    'DECIMAL',
    'DATE',
    'COLOR'
  ];

  showMetaCampoForm = false;
  metaCampoEditIndex: number | null = null;

  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef<HTMLInputElement>>;
  fileInputRefs: Record<string, HTMLInputElement> = {};

  constructor(
    public dialogRef: MatDialogRef<DynamicFormDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      model: any;
      title?: string;
      icon?: string;
      labels?: Record<string, string>;
      selectOptions?: Record<string, any[]>;
      fileFields?: string[];
      orderedKeys?: string[];
      readonlyFields?: string[];
      company?: { id: string, name: string }[];
      fieldConfig?: Record<string, FieldConfig>;
      isMetaTabla?: boolean;
      id?: string;
    },
    private fb: FormBuilder,
  ) {
    this.labelMap = data.labels ?? {};
    this.selectOptions = data.selectOptions ?? {};
    this.fileFields = data.fileFields ?? [];
    this.readonlyFields = data.readonlyFields ?? [];
    this.companys = data.company ?? [];
    this.fieldConfig = data.fieldConfig ?? {};


    if (this.companys.length > 0) {
      this.selectOptions['company'] = this.companys;
    }
    // Inicia con los metaCampos ya pasados (al editar)
    if (this.data.isMetaTabla) {
      this.metaCampos = Array.isArray(data.model?.metaCampos) ? [...data.model.metaCampos] : [];
    }
  }

  ngOnInit(): void {
    const excluded = ['id', 'roles', 'active', 'metaCampos', '_tabla', '_id'];
    const modelKeys = Object.keys(this.data.model).filter(k => !excluded.includes(k));
    this.keys = this.data.orderedKeys ?? modelKeys;

    const group: Record<string, any> = {};
    for (const key of this.keys) {
      const initialValue = key === 'password' ? '' : this.data.model[key];
      const isDisabled = this.isReadOnly(key);
      const config = this.fieldConfig[key] || {};

      group[key] = this.fb.control(
        { value: initialValue, disabled: isDisabled },
        config.validators || []
      );
    }
    this.form = this.fb.group(group);

    // Inicializar el formulario para agregar/editar metaCampo (solo si es para metaTabla)
    if (this.data.isMetaTabla) {
      this.metaCampoForm = this.fb.group({
        campo: ['', Validators.required],
        tipo: ['', Validators.required],
        obligatorio: [false],
        visible: [true],
        orden: [this.metaCampos.length, [Validators.required, Validators.min(1)]]
      });
    }


  }

  ngAfterViewInit(): void {
    this.fileInputs.forEach((ref) => {
      const key = ref.nativeElement.getAttribute('data-key');
      if (key) {
        this.fileInputRefs[key] = ref.nativeElement;
      }
    });
  }

  onFileChange(event: Event, key: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.form.patchValue({ [key]: file });
      this.fileNames[key] = file.name;
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  isTextarea(key: string): boolean {
    return key.toLowerCase().includes('description') || key.toLowerCase().includes('detalle');
  }

  isNumber(value: any): boolean {
    if (this.fieldConfig[value]?.type === 'number') return true;
    return typeof value === 'number';
  }

  isLevelField(key: string): boolean {
    return key.toLowerCase() === 'level';
  }

  isSelectField(key: string): boolean {
    return this.selectOptions.hasOwnProperty(key);
  }

  isFileField(key: string): boolean {
    return this.fileFields.includes(key);
  }

  isReadOnly(key: string): boolean {
    return this.readonlyFields.includes(key);
  }

  // Asume que tienes un fieldConfig, o puedes basar la detección solo en el nombre del campo
  isColorField(key: string): boolean {
    if (this.fieldConfig && this.fieldConfig[key]?.type) {
      return this.fieldConfig[key].type.toUpperCase() === 'COLOR';
    }
    return key.toLowerCase().includes('color');
  }

  isBooleanField(key: string): boolean {
    if (this.fieldConfig && this.fieldConfig[key]?.type) {
      return this.fieldConfig[key].type.toUpperCase() === 'Estado';
    }
    return key.toLowerCase().includes('estado');

  }

  guardar(): void {
    if (this.form.valid) {
      if (this.data.isMetaTabla) {
        this.dialogRef.close({
          ...this.form.value,
          metaCampos: this.metaCampos
        });
      } else {
        this.dialogRef.close(this.form.value);
      }
    }
  }

  getCompanyNameById(id: string): string {
    return this.companys.find(c => c.id === id)?.name || 'Desconocido';
  }

  getInputType(key: string): string {
    const type = this.fieldConfig[key]?.type;
    if (type === 'password') return 'password';
    if (type === 'number') return 'number';
    if (type === 'email') return 'email';
    return 'text';
  }
}

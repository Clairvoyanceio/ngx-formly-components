import { Component, OnInit, DoCheck, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Field } from 'ng-formly';
import { Subject } from 'rxjs/Subject';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'formly-ngx-material-input',
    styles: [`
    :host /deep/ .ui-inputtext {
        width: 100%;
        border: none !important;
    }
  `],
    template: `
    <div class="" [ngStyle]="{color:formControl.errors?'#f44336':'inherit'}">
        <md-input-container style="width: 100%">
            <input mdInput [placeholder]="to.placeholder" type="text" [formControl]="fControl" [mdAutocomplete]="autocomplete" [value]="value"/>
        </md-input-container>
        <md-autocomplete #autocomplete="mdAutocomplete">
            <md-option *ngFor="let item of filteredItems" [value]="item">{{item}}</md-option>
        </md-autocomplete>
  </div>
  `,
})
export class FormlyInputComponent extends Field implements OnInit, OnDestroy {

    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public fControl: FormControl = new FormControl();
    public items: any[];
    public filteredItems: any[];
    public value: string;

    constructor(private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    public ngOnInit() {
        if(this.to.disabled){
            this.fControl.disable();
        }
        if (this.to.source) {
            this.to.source.takeUntil(this.ngUnsubscribe).subscribe(x => {
                this.items = x;
            });
        }
        if (this.to.defaultValue && !this.formControl.value) {
            this.formControl.setValue(this.to.defaultValue);
        }
        this.fControl.setValue(this.formControl.value);

        this.fControl.valueChanges.takeUntil(this.ngUnsubscribe).subscribe(e => {
            this.filteredItems = this.filter(e);

            let result = e;
            if (this.to.maxLength && e.length > this.to.maxLength) {
                result = result.substr(0, this.to.maxLength);
            }
            if (this.to.format) {
                result = this.to.format(e);
            }
            this.value = null;
            this.changeDetectorRef.detectChanges();
            this.value = result;
            this.changeDetectorRef.detectChanges();
            this.formControl.setValue(e);
        });
    }

    filter(val: string): string[] {
        if (!this.items) {
            return null;
        }

        let items = this.items;
        if (this.to.sourceFilter) {
            items = this.to.sourceFilter(this.items);
        }

        return items.filter(option => {
            if (!option) {
                return false;
            }
            if (!val) {
                return true;
            }
            option = option.toString();
            val = val.toString();
            return option.toLowerCase().indexOf(val.toLowerCase()) >= 0;
        });
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
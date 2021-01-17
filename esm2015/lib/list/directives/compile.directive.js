import { Directive, Input, ViewContainerRef, Compiler, Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
export class cfTemplateDirective {
    constructor(vcRef, compiler) {
        this.vcRef = vcRef;
        this.compiler = compiler;
    }
    ngOnChanges() {
        if (!this.cfTemplate) {
            if (this.componentRef) {
                this.updateProperties();
                return;
            }
            throw Error('You must provide template.');
        }
        this.vcRef.clear();
        this.componentRef = null;
        const component = this.createDynamicComponent(this.cfTemplate);
        const module = this.createDynamicModule(component);
        this.compiler.compileModuleAndAllComponentsAsync(module)
            .then((moduleWithFactories) => {
            let componentFactory = moduleWithFactories.componentFactories.find(x => x.componentType === component);
            this.componentRef = this.vcRef.createComponent(componentFactory);
            this.updateProperties();
        })
            .catch(error => {
            console.log(error);
        });
    }
    updateProperties() {
        for (var prop in this.cfTemplateContext) {
            this.componentRef.instance[prop] = this.cfTemplateContext[prop];
        }
    }
    createDynamicComponent(template) {
        class CustomDynamicComponent {
        }
        CustomDynamicComponent.decorators = [
            { type: Component, args: [{
                        selector: 'cf-dynamic-component',
                        template: template
                    },] }
        ];
        return CustomDynamicComponent;
    }
    createDynamicModule(component) {
        class DynamicModule {
        }
        DynamicModule.decorators = [
            { type: NgModule, args: [{
                        // Every element you might need must be known for this module
                        imports: [CommonModule],
                        declarations: [component]
                    },] }
        ];
        return DynamicModule;
    }
}
cfTemplateDirective.decorators = [
    { type: Directive, args: [{
                selector: '[cfTemplate]'
            },] }
];
cfTemplateDirective.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: Compiler }
];
cfTemplateDirective.propDecorators = {
    cfTemplate: [{ type: Input }],
    cfTemplateContext: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL25pdGlua2hhaXRhbi9OaXRpbi9zdHVkeS9hbmd1bGFyL21hdGVyaWFsL2FkbWluLWJ1aWxkZXItcGx1Z2luL3Byb2plY3RzL2FkbWluLWJ1aWxkZXIvc3JjLyIsInNvdXJjZXMiOlsibGliL2xpc3QvZGlyZWN0aXZlcy9jb21waWxlLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUNULEtBQUssRUFHTCxnQkFBZ0IsRUFDaEIsUUFBUSxFQUVSLFNBQVMsRUFDVCxRQUFRLEVBRVQsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBSzlDLE1BQU0sT0FBTyxtQkFBbUI7SUFNOUIsWUFBb0IsS0FBdUIsRUFBVSxRQUFrQjtRQUFuRCxVQUFLLEdBQUwsS0FBSyxDQUFrQjtRQUFVLGFBQVEsR0FBUixRQUFRLENBQVU7SUFBSSxDQUFDO0lBRTVFLFdBQVc7UUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNwQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN4QixPQUFPO2FBQ1I7WUFDRCxNQUFNLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQzNDO1FBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUV6QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVuRCxJQUFJLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxDQUFDLE1BQU0sQ0FBQzthQUNyRCxJQUFJLENBQUMsQ0FBQyxtQkFBc0QsRUFBRSxFQUFFO1lBQy9ELElBQUksZ0JBQWdCLEdBQUcsbUJBQW1CLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsS0FBSyxTQUFTLENBQUMsQ0FBQztZQUV2RyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDMUIsQ0FBQyxDQUFDO2FBQ0QsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxnQkFBZ0I7UUFDZCxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUN2QyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDakU7SUFDSCxDQUFDO0lBRU8sc0JBQXNCLENBQUMsUUFBZ0I7UUFDN0MsTUFJTSxzQkFBc0I7OztvQkFKM0IsU0FBUyxTQUFDO3dCQUNULFFBQVEsRUFBRSxzQkFBc0I7d0JBQ2hDLFFBQVEsRUFBRSxRQUFRO3FCQUNuQjs7UUFFRCxPQUFPLHNCQUFzQixDQUFDO0lBQ2hDLENBQUM7SUFFTyxtQkFBbUIsQ0FBQyxTQUFvQjtRQUM5QyxNQUtNLGFBQWE7OztvQkFMbEIsUUFBUSxTQUFDO3dCQUNSLDZEQUE2RDt3QkFDN0QsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO3dCQUN2QixZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUM7cUJBQzFCOztRQUVELE9BQU8sYUFBYSxDQUFDO0lBQ3ZCLENBQUM7OztZQTdERixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGNBQWM7YUFDekI7OztZQVhDLGdCQUFnQjtZQUNoQixRQUFROzs7eUJBWVAsS0FBSztnQ0FDTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBDb21wb25lbnRSZWYsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIENvbXBpbGVyLFxuICBNb2R1bGVXaXRoQ29tcG9uZW50RmFjdG9yaWVzLFxuICBDb21wb25lbnQsXG4gIE5nTW9kdWxlLFxuICBUeXBlXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJ1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbY2ZUZW1wbGF0ZV0nXG59KVxuZXhwb3J0IGNsYXNzIGNmVGVtcGxhdGVEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICBASW5wdXQoKSBjZlRlbXBsYXRlOiBzdHJpbmc7XG4gIEBJbnB1dCgpIGNmVGVtcGxhdGVDb250ZXh0OiBhbnk7XG5cbiAgY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55PjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHZjUmVmOiBWaWV3Q29udGFpbmVyUmVmLCBwcml2YXRlIGNvbXBpbGVyOiBDb21waWxlcikgeyB9XG5cbiAgbmdPbkNoYW5nZXMoKSB7XG4gICAgaWYgKCF0aGlzLmNmVGVtcGxhdGUpIHtcbiAgICAgIGlmICh0aGlzLmNvbXBvbmVudFJlZikge1xuICAgICAgICB0aGlzLnVwZGF0ZVByb3BlcnRpZXMoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhyb3cgRXJyb3IoJ1lvdSBtdXN0IHByb3ZpZGUgdGVtcGxhdGUuJyk7XG4gICAgfVxuXG4gICAgdGhpcy52Y1JlZi5jbGVhcigpO1xuICAgIHRoaXMuY29tcG9uZW50UmVmID0gbnVsbDtcblxuICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMuY3JlYXRlRHluYW1pY0NvbXBvbmVudCh0aGlzLmNmVGVtcGxhdGUpO1xuICAgIGNvbnN0IG1vZHVsZSA9IHRoaXMuY3JlYXRlRHluYW1pY01vZHVsZShjb21wb25lbnQpO1xuXG4gICAgdGhpcy5jb21waWxlci5jb21waWxlTW9kdWxlQW5kQWxsQ29tcG9uZW50c0FzeW5jKG1vZHVsZSlcbiAgICAgIC50aGVuKChtb2R1bGVXaXRoRmFjdG9yaWVzOiBNb2R1bGVXaXRoQ29tcG9uZW50RmFjdG9yaWVzPGFueT4pID0+IHtcbiAgICAgICAgbGV0IGNvbXBvbmVudEZhY3RvcnkgPSBtb2R1bGVXaXRoRmFjdG9yaWVzLmNvbXBvbmVudEZhY3Rvcmllcy5maW5kKHggPT4geC5jb21wb25lbnRUeXBlID09PSBjb21wb25lbnQpO1xuXG4gICAgICAgIHRoaXMuY29tcG9uZW50UmVmID0gdGhpcy52Y1JlZi5jcmVhdGVDb21wb25lbnQoY29tcG9uZW50RmFjdG9yeSk7XG4gICAgICAgIHRoaXMudXBkYXRlUHJvcGVydGllcygpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlUHJvcGVydGllcygpIHtcbiAgICBmb3IgKHZhciBwcm9wIGluIHRoaXMuY2ZUZW1wbGF0ZUNvbnRleHQpIHtcbiAgICAgIHRoaXMuY29tcG9uZW50UmVmLmluc3RhbmNlW3Byb3BdID0gdGhpcy5jZlRlbXBsYXRlQ29udGV4dFtwcm9wXTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUR5bmFtaWNDb21wb25lbnQodGVtcGxhdGU6IHN0cmluZykge1xuICAgIEBDb21wb25lbnQoe1xuICAgICAgc2VsZWN0b3I6ICdjZi1keW5hbWljLWNvbXBvbmVudCcsXG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbiAgICB9KVxuICAgIGNsYXNzIEN1c3RvbUR5bmFtaWNDb21wb25lbnQgeyB9XG4gICAgcmV0dXJuIEN1c3RvbUR5bmFtaWNDb21wb25lbnQ7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUR5bmFtaWNNb2R1bGUoY29tcG9uZW50OiBUeXBlPGFueT4pIHtcbiAgICBATmdNb2R1bGUoe1xuICAgICAgLy8gRXZlcnkgZWxlbWVudCB5b3UgbWlnaHQgbmVlZCBtdXN0IGJlIGtub3duIGZvciB0aGlzIG1vZHVsZVxuICAgICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXG4gICAgICBkZWNsYXJhdGlvbnM6IFtjb21wb25lbnRdXG4gICAgfSlcbiAgICBjbGFzcyBEeW5hbWljTW9kdWxlIHsgfVxuICAgIHJldHVybiBEeW5hbWljTW9kdWxlO1xuICB9XG59Il19
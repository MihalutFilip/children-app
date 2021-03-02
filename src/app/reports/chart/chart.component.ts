import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';

declare var ApexCharts: any;

@Component({
  selector: 'chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnChanges {
  @Input() options: any;
  @Output() onMounted = new EventEmitter();

  @ViewChild('chart', { static: true }) private chartElement: ElementRef;
  private chartObj: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.renderChart().then(() => {
        this.onMounted.emit();
      });
    }
  }

  public renderChart(): Promise<void> {
    if (this.chartObj) {
      this.chartObj.destroy();
    }

    this.chartObj = new ApexCharts(
      this.chartElement.nativeElement,
      this.options
    );

    return this.render();
  }

  public render(): Promise<void> {
    return this.chartObj.render();
  }

  public toggleDataPointSelection(seriesIndex: number, dataPointIndex?: number) {
    this.chartObj.toggleDataPointSelection(seriesIndex, dataPointIndex);
  }

  public updateSeries(newSeries, animate: boolean) {
    this.chartObj.updateSeries(newSeries, animate);
  }
}
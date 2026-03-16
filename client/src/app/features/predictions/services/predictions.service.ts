import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { MLPrediction } from '../../../models/prediction.model';

@Injectable({ providedIn: 'root' })
export class PredictionsService {
  private readonly api = inject(ApiService);

  private readonly _predictions = signal<MLPrediction[]>([]);
  private readonly _selectedPrediction = signal<MLPrediction | null>(null);
  private readonly _loading = signal(false);

  readonly predictions = this._predictions.asReadonly();
  readonly selectedPrediction = this._selectedPrediction.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadPredictions(): void {
    this._loading.set(true);
    this.api.get<MLPrediction[]>(ENDPOINTS.PREDICTIONS.LIST).subscribe({
      next: (predictions) => {
        this._predictions.set(predictions);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  loadPrediction(id: string): void {
    this._loading.set(true);
    this.api.get<MLPrediction>(ENDPOINTS.PREDICTIONS.DETAIL(id)).subscribe({
      next: (prediction) => {
        this._selectedPrediction.set(prediction);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }
}

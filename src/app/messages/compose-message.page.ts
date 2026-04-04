import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { MessagesApiService } from '../core/services/messages-api.service';
import {
  NeighborDirectoryEntry,
  UsersApiService,
} from '../core/services/users-api.service';
@Component({
  selector: 'app-compose-message',
  templateUrl: './compose-message.page.html',
  styleUrls: ['./compose-message.page.scss'],
  standalone: false,
})
export class ComposeMessagePage implements OnInit {
  form: FormGroup;
  neighbors: NeighborDirectoryEntry[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly messagesApi: MessagesApiService,
    private readonly usersApi: UsersApiService,
    private readonly loadingCtrl: LoadingController,
    private readonly toastCtrl: ToastController,
  ) {
    this.form = this.fb.group({
      to: ['estate', Validators.required],
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const st = history.state as { subject?: string } | undefined;
    if (st?.subject) {
      this.form.patchValue({ subject: st.subject });
    }
    this.usersApi.getNeighborDirectory().subscribe({
      next: (list) => {
        this.neighbors = list;
      },
      error: () => {
        this.neighbors = [];
      },
    });
  }

  async send(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const loading = await this.loadingCtrl.create({ message: 'Sending…' });
    await loading.present();
    const v = this.form.value;
    const recipientId =
      v.to === 'estate' || v.to === '' ? null : (v.to as string);
    this.messagesApi
      .create({
        subject: v.subject?.trim(),
        body: v.message?.trim(),
        recipientId,
      })
      .pipe(finalize(() => loading.dismiss()))
      .subscribe({
        next: () => void this.router.navigate(['/messages']),
        error: (err: HttpErrorResponse) => void this.toastHttp(err),
      });
  }

  private async toastHttp(err: HttpErrorResponse): Promise<void> {
    const body = err.error as { message?: string | string[] } | null;
    let msg = err.message || 'Request failed';
    if (body?.message) {
      msg = Array.isArray(body.message) ? body.message.join(', ') : String(body.message);
    }
    const t = await this.toastCtrl.create({
      message: msg,
      duration: 3500,
      color: 'danger',
      position: 'bottom',
    });
    await t.present();
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}

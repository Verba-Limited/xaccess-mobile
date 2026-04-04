import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageItem } from './messages.page';
import { MessagesApiService } from '../core/services/messages-api.service';

@Component({
  selector: 'app-message-info',
  templateUrl: './message-info.page.html',
  styleUrls: ['./message-info.page.scss'],
  standalone: false,
})
export class MessageInfoPage implements OnInit {
  message: (MessageItem & { body?: string }) | null = null;
  loading = false;

  constructor(
    private readonly router: Router,
    private readonly messagesApi: MessagesApiService,
  ) {}

  ngOnInit(): void {
    const id = history.state?.['messageId'] as string | undefined;
    if (!id) {
      void this.router.navigate(['/messages']);
      return;
    }
    this.loading = true;
    this.messagesApi.getOne(id).subscribe({
      next: (row) => {
        const d = new Date(row.createdAt);
        const date = d.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        });
        const time = d.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        this.message = {
          id: row.id,
          title: row.subject,
          from: row.senderName || 'Unknown',
          preview: '',
          date,
          time,
          body: row.body,
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        void this.router.navigate(['/messages']);
      },
    });
  }

  openMessageMenu(event: Event): void {
    event.stopPropagation();
    console.log('Message options', this.message);
  }

  reply(): void {
    void this.router.navigate(['/messages/compose'], {
      state: {
        subject: `Re: ${this.message?.title ?? ''}`,
      },
    });
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { MessageDto, MessagesApiService } from '../core/services/messages-api.service';

export interface MessageItem {
  id: string;
  title: string;
  from: string;
  preview: string;
  date: string;
  time: string;
  body?: string;
}

function formatParts(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { date: '—', time: '—' };
  }
  return {
    date: d.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }),
    time: d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };
}

function mapReceived(row: MessageDto): MessageItem {
  const { date, time } = formatParts(row.createdAt);
  return {
    id: row.id,
    title: row.subject,
    from: row.senderName || 'Unknown',
    preview: row.body.slice(0, 80) + (row.body.length > 80 ? '…' : ''),
    date,
    time,
    body: row.body,
  };
}

function mapSent(row: MessageDto): MessageItem {
  const { date, time } = formatParts(row.createdAt);
  const toLabel = row.recipientId
    ? `To: ${row.recipientName || 'Neighbor'}`
    : 'To: Estate Management';
  return {
    id: row.id,
    title: row.subject,
    from: toLabel,
    preview: row.body.slice(0, 80) + (row.body.length > 80 ? '…' : ''),
    date,
    time,
    body: row.body,
  };
}

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
  standalone: false,
})
export class MessagesPage implements ViewWillEnter {
  activeTab: 'received' | 'sent' = 'received';
  searchQuery = '';
  showActionSheet = false;
  selectedMessage: MessageItem | null = null;
  receivedMessages: MessageItem[] = [];
  sentMessages: MessageItem[] = [];
  loading = false;
  loadError: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly messagesApi: MessagesApiService,
  ) {}

  ionViewWillEnter(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = null;
    forkJoin([this.messagesApi.inbox(), this.messagesApi.sent()])
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ([inboxRows, sentRows]) => {
          this.receivedMessages = inboxRows.map(mapReceived);
          this.sentMessages = sentRows.map(mapSent);
        },
        error: (e: Error) => {
          this.loadError = e.message || 'Could not load messages';
          this.receivedMessages = [];
          this.sentMessages = [];
        },
      });
  }

  setTab(tab: 'received' | 'sent'): void {
    this.activeTab = tab;
  }

  openFilter(): void {
    console.log('Open filter');
  }

  openMessage(item: MessageItem): void {
    this.router.navigate(['/messages/info'], {
      state: { messageId: item.id },
    });
  }

  openMessageMenu(item: MessageItem, event?: Event): void {
    event?.stopPropagation();
    this.selectedMessage = item;
    this.showActionSheet = true;
  }

  dismissActionSheet(): void {
    this.showActionSheet = false;
    this.selectedMessage = null;
  }

  onForwardMessage(): void {
    if (this.selectedMessage) {
      this.handleForwardMessage(this.selectedMessage);
    }
    this.dismissActionSheet();
  }

  onDeleteMessage(): void {
    if (this.selectedMessage) {
      this.handleDeleteMessage(this.selectedMessage);
    }
    this.dismissActionSheet();
  }

  private handleForwardMessage(item: MessageItem): void {
    console.log('Forward message', item);
  }

  private handleDeleteMessage(item: MessageItem): void {
    console.log('Delete message', item);
  }

  goToCompose(): void {
    this.router.navigate(['/messages/compose']);
  }

  onCenterAction(): void {
    this.router.navigate(['/messages/compose']);
  }

  filteredReceived(): MessageItem[] {
    return this.filterList(this.receivedMessages);
  }

  filteredSent(): MessageItem[] {
    return this.filterList(this.sentMessages);
  }

  private filterList(list: MessageItem[]): MessageItem[] {
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.from.toLowerCase().includes(q) ||
        m.preview.toLowerCase().includes(q),
    );
  }
}

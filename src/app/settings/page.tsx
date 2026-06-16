'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Volume2, Check } from 'lucide-react';
import { TTS_VOICES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('narrator');

  useEffect(() => {
    setMounted(true);
    const savedVoice = localStorage.getItem('history-story-voice');
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('history-story-voice', selectedVoice);
    router.push('/');
  };

  if (!mounted) {
    return null;
  }

  const voiceEntries = Object.entries(TTS_VOICES);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                音色选择
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>选择讲述声音</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedVoice}
                onValueChange={setSelectedVoice}
                className="space-y-4"
              >
                {voiceEntries.map(([key, voice]) => (
                  <div
                    key={key}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-lg border border-border cursor-pointer transition-colors',
                      selectedVoice === key
                        ? 'bg-primary/5 border-primary'
                        : 'hover:bg-muted/50'
                    )}
                    onClick={() => setSelectedVoice(key)}
                  >
                    <RadioGroupItem value={key} id={key} className="mt-1" />
                    <Label
                      htmlFor={key}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium text-foreground flex items-center gap-2">
                        {voice.name}
                        {selectedVoice === key && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {voice.desc}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <Button onClick={handleSave} className="w-full mt-6">
                保存设置
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

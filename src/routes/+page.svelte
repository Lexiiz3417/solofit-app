<script lang="ts">
  // Impor komponen UI dari shadcn-svelte
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { Progress } from '$lib/components/ui/progress';

  // Data bohongan untuk UI
  let currentEp = 45;
  const targetEp = 80;
  const maxEp = 100;
  const currentStreak = 12;
</script>

<div class="flex flex-col gap-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold">Today's Mission</h1>
    <div class="flex items-center gap-2 text-lg">
      <span class="text-orange-400">🔥</span>
      <span class="font-bold">{currentStreak} Day Streak</span>
    </div>
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title>Workout Day Quest</Card.Title>
      <Card.Description>
        Selesaikan target minimum <strong>{targetEp} EP</strong> untuk menyelesaikan quest hari ini dan mendapatkan reward.
      </Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div>
        <div class="flex justify-between mb-1">
          <span class="text-sm font-medium text-primary">Energy Points (EP)</span>
          <span class="text-sm font-medium">{currentEp} / {maxEp}</span>
        </div>
        <Progress value={(currentEp / maxEp) * 100} />
      </div>
      <p class="text-xs text-muted-foreground">
        EP didapat dari menyelesaikan set latihan. Kamu bisa "mencicil" progres latihanmu sepanjang hari.
      </p>
    </Card.Content>
    <Card.Footer>
      <Button>Lihat & Lanjutkan Latihan</Button>
    </Card.Footer>
  </Card.Root>
</div>
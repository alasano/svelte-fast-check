<script lang="ts">
  import type { User } from 'shared/types';
  import { greet } from 'shared/types';
  import { formatDate } from '$lib/utils';

  const user: User = { id: 1, name: 'World' };
  const message = greet(user);
  const now = formatDate(new Date());
</script>

<h1>{message}</h1>
<p>Current time: {now}</p>

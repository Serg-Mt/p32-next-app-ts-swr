'use client';
import useSWR from 'swr';

async function fetcher(url: string | URL) {
  const responce = await fetch(url);
  return await responce.json()
}

interface User {
  id: number,
  name: string,
  email: string
}

export function FetchUsers() {
  const { data, error, isLoading, isValidating } = useSWR<User[]>('https://jsonplaceholder.typicode.com/users/', fetcher);
  if (error) return <div>ошибка загрузки</div>
  {isLoading && '⌛'};
  return <>
    {isValidating && '⚡'}
    {data && <ol>
      {data.map(user => <li key={user.id}>{user.name} - {user.email}</li>)}
    </ol>}
  </>;
}


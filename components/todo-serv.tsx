'use client';

import { MouseEventHandler, useRef } from 'react';
import useSWR from 'swr';
import { nanoid } from 'nanoid'
import toast, { type ToastOptions } from 'react-hot-toast';

const
  ADD = 'add',
  DEL = 'del',
  TOGGLE = 'toggle',
  endpoint = 'http://localhost:3333/todos';

type NonFunctionPropertyNames<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

class Item {
  id = nanoid(); //Math.random()
  checked = false;
  text = '-default-';

  static from(obj: NonFunctionProperties<Item>) {
    return Object.assign(new Item, obj);
  }

  constructor(text?: string) {
    Object.assign(this, { text }); //this.text = text;
  }

  toggleCheck() {
    return Object.assign(new Item, this, { checked: !this.checked });
  }
}

async function fetcher(url: string | URL) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(response.statusText + response.status);
  return await response.json()
}

const DEBUG_TOAST_OPTIONS: ToastOptions = {
  icon: '👓',
  position: 'bottom-right',
  style: { fontSize: 'xx-small' }
};

export function ToDoServ() {
  const
    ref = useRef(null),
    { data, error, isLoading, isValidating, mutate } = useSWR<Item[]>(endpoint,
      (url: Parameters<typeof fetcher>[0]) => {
        const promise = fetcher(url);
        toast.promise(promise, { // только для отладки
          loading: 'fetch',
          success: 'ok',
          error: 'ERROR'
        }, DEBUG_TOAST_OPTIONS)
        return promise;
      }
    ),
    onClick: MouseEventHandler = async (event) => {
      const
        { target } = event,
        actionTarget = (target as HTMLElement).closest('[data-action]');
      if (!actionTarget)
        return;
      const { action } = (actionTarget as HTMLElement)?.dataset,
        id = ((target as HTMLElement)?.closest('[data-id]') as HTMLElement)?.dataset?.id;
      // console.log({ target, actionTarget, action, id });
      switch (action) {
        case ADD:
          const
            text = (ref.current! as HTMLInputElement).value,
            item = new Item(text),
            optimisticData = [...data!, item],
            updateFn = async () => {
              const
                generate = async () => {
                  const
                    response = await fetch(endpoint + '', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(item)
                    });
                  // console.log({ response },);
                  if (!response.ok)
                    throw new Error(response.statusText + response.status);
                  return await response.json() as NonFunctionProperties<Item>;
                },
                promise = generate();
              toast.promise(promise, { // только для отладки
                loading: 'Adding',
                success: 'Ok',
                error: 'Error add item',
              }, DEBUG_TOAST_OPTIONS);
              try {
                const item = await promise;
                return [...data!, Item.from(item)]; // поправил
              } catch {
                toast.error('Error add item'); // важно информировать пользователя OPTIMISTIC UI 
                return [...data!];
              }
            };
          mutate(updateFn(), { optimisticData, revalidate: false });

          return;
        case DEL:
          fetch(endpoint + '/' + id,
            { method: 'DELETE' })
          return;

        case TOGGLE:
          return;
      }
    };



  return <fieldset onClick={onClick}>
    <label><input ref={ref} /><button data-action={ADD}>add</button></label>
    {error && <div className="error">ERROR:</div>}
    {isLoading && '⌛'}
    {isValidating && '⚡'}
    {data && <ol>
      {data.map(item => <ToDoItem key={item.id} item={item} />)}
    </ol>}
  </fieldset>
}

function ToDoItem({ item }: { item: Item }) {
  // console.log('Item render', item.text);
  return <li data-id={item.id}>
    <label>
      <input readOnly type="checkbox" checked={item.checked} data-action={TOGGLE} />
      {item.text}
    </label>
    {item.checked && '✔'}
    <button data-action={DEL} > ❌</button>
  </li>
}
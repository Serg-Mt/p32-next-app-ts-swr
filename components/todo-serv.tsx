'use client';

import { MouseEventHandler, useRef } from 'react';
import useSWR from 'swr';
import { nanoid } from 'nanoid'
import toast from 'react-hot-toast';

const
  ADD = 'add',
  DEL = 'del',
  TOGGLE = 'toggle',
  endpoint = 'http://localhost:3333/todos';


class Item {
  id = nanoid(); //Math.random()
  checked = false;
  text = '-default-';

  static from(obj) {
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
  const responce = await fetch(url);
  return await responce.json()
}



export function ToDoServ() {
  const
    ref = useRef(null),
    { data, error, isLoading, isValidating, mutate } = useSWR<Item[]>(endpoint, fetcher),
    onClick: MouseEventHandler = async (event) => {
      const
        { target } = event,
        actionTarget = (target as HTMLElement).closest('[data-action]');
      if (!actionTarget)
        return;
      const { action } = (actionTarget as HTMLElement)?.dataset,
        id = ((target as HTMLElement)?.closest('[data-id]') as HTMLElement)?.dataset?.id;
      console.log({ target, actionTarget, action, id });
      switch (action) {
        case ADD:
          const
            text = (ref.current! as HTMLInputElement).value,
            item = new Item(text),
            optimisticData = [...data, item],
            updateFn = async () => {
              const
                promise = fetch(endpoint + '/aaa', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(item)
                });
              // toast.promise(promise, {
              //   loading: 'Adding',
              //   success: 'Ok',
              //   error: 'Error add item'
              // });
              const response = await promise;
              console.log({ response }, await response.json());
              if (response.ok) {
                return optimisticData;
              } else {
                toast('Error add item');
                return [...data];
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
    <input ref={ref} /><button data-action={ADD}>add</button>
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
    <input readOnly type="checkbox" checked={item.checked} data-action={TOGGLE} />
    {item.text}
    {item.checked && '✔'}
    <button data-action={DEL} > ❌</button>
  </li>
}
import Link from 'next/link';
import classes from './nav.module.css';

const
  pages = [
    { href: '/', title: 'Home' },
    { href: '/swr-demo', title: 'demo SWR' },
    // { href: '/todo2', title: 'To Do List +delegation' },
    // { href: '/calendar', title: 'Calendar' },

  ];

export function Nav() {
  return <nav className={classes.nav}>
    <ul>
      {pages.map(({ href, title }) =>
        <li key={href}>
          <Link href={href}>{title}</Link>
        </li>)}
    </ul>
  </nav>
}
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './config';
import type { MenuItem, Reservation, BusinessConfig, Category } from '../types';

// ─── Menu ────────────────────────────────────────────────
export function onMenu(cb: (items: MenuItem[]) => void) {
  return onSnapshot(
    collection(db, 'menuItems'),
    (snap) => {
      const items: MenuItem[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() } as MenuItem));
      cb(items);
    },
    (err) => console.error('Menu error:', err)
  );
}

export async function saveItem(item: MenuItem) {
  const { id, ...data } = item;
  await setDoc(doc(db, 'menuItems', id), data);
}

export async function removeItem(id: string) {
  await deleteDoc(doc(db, 'menuItems', id));
}

// ─── Categories ──────────────────────────────────────────
export function onCategories(cb: (cats: Category[]) => void) {
  return onSnapshot(
    collection(db, 'categories'),
    (snap) => {
      const cats: Category[] = [];
      snap.forEach((d) => cats.push({ id: d.id, ...d.data() } as Category));
      cb(cats);
    },
    (err) => console.error('Categories error:', err)
  );
}

export async function saveCat(cat: Category) {
  const { id, ...data } = cat;
  await setDoc(doc(db, 'categories', id), data);
}

export async function removeCat(id: string) {
  await deleteDoc(doc(db, 'categories', id));
}

// ─── Reservations ────────────────────────────────────────
export function onReservations(cb: (res: Reservation[]) => void) {
  return onSnapshot(
    collection(db, 'reservations'),
    (snap) => {
      const res: Reservation[] = [];
      snap.forEach((d) => res.push({ id: d.id, ...d.data() } as Reservation));
      res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      cb(res);
    },
    (err) => console.error('Reservations error:', err)
  );
}

export async function saveRes(r: Reservation) {
  const { id, ...data } = r;
  await setDoc(doc(db, 'reservations', id), data);
}

export async function removeRes(id: string) {
  await deleteDoc(doc(db, 'reservations', id));
}

// ─── Business Config ─────────────────────────────────────
export function onBusiness(cb: (config: BusinessConfig | null) => void) {
  return onSnapshot(
    doc(db, 'config', 'business'),
    (snap) => {
      cb(snap.exists() ? (snap.data() as BusinessConfig) : null);
    },
    (err) => console.error('Business error:', err)
  );
}

export async function saveBusiness(config: BusinessConfig) {
  const plain = JSON.parse(JSON.stringify(config));
  await setDoc(doc(db, 'config', 'business'), plain);
}

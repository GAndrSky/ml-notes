// Builds 11_sql/sql-course-data.js: the «Вольт» dataset (deterministic) + all SQL tasks.
// usage: node scripts/sql-course/build.mjs   (from the repo root; no dependencies)
import fs from 'node:fs';
import { TASKS } from './tasks.mjs';

// ---------- deterministic random ----------
let seed = 20251231;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
const day = (d) => new Date(Date.UTC(2025, 0, 1) + d * 86400000).toISOString().slice(0, 10);
const q = (v) => v === null ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`;

// ---------- employees ----------
const employees = [
  [1, 'Анна Соколова', 'руководитель поддержки', '2021-03-15'],
  [2, 'Игорь Белов', 'поддержка', '2022-06-01'],
  [3, 'Мария Кузнецова', 'поддержка', '2023-01-10'],
  [4, 'Павел Смирнов', 'поддержка', '2023-09-04'],
  [5, 'Ольга Морозова', 'склад', '2022-02-20'],
  [6, 'Кирилл Орлов', 'поддержка', '2025-04-14'],
  [7, 'Елена Новикова', 'финансы', '2020-11-02'],
  [8, 'Сергей Волков', 'склад', '2024-07-08'],
];

// ---------- products (distinct prices) ----------
const products = [
  [1, 'Ноутбук Volt Air 13', 'Ноутбуки', 89990], [2, 'Ноутбук Volt Pro 15', 'Ноутбуки', 149990],
  [3, 'Ноутбук Volt Pro 17', 'Ноутбуки', 189990], [4, 'Ноутбук Volt Student', 'Ноутбуки', 54990],
  [5, 'Смартфон Volt One', 'Смартфоны', 39990], [6, 'Смартфон Volt One Pro', 'Смартфоны', 79990],
  [7, 'Смартфон Volt Mini', 'Смартфоны', 24990], [8, 'Смартфон Volt Max', 'Смартфоны', 99990],
  [9, 'Наушники Volt Buds', 'Наушники', 7990], [10, 'Наушники Volt Buds Pro', 'Наушники', 15990],
  [11, 'Наушники Volt Studio', 'Наушники', 29990], [12, 'Наушники Volt Sport', 'Наушники', 5490],
  [13, 'Монитор Volt View 24', 'Мониторы', 18990], [14, 'Монитор Volt View 27', 'Мониторы', 32990],
  [15, 'Монитор Volt Pro Display 32', 'Мониторы', 74990], [16, 'Планшет Volt Tab 10', 'Планшеты', 34990],
  [17, 'Планшет Volt Tab Pro 12', 'Планшеты', 69990], [18, 'Планшет Volt Tab Kids', 'Планшеты', 14990],
  [19, 'Чехол Volt Case', 'Аксессуары', 1490], [20, 'Зарядка Volt Charge 65W', 'Аксессуары', 3490],
  [21, 'Кабель Volt USB-C', 'Аксессуары', 990], [22, 'Мышь Volt Mouse', 'Аксессуары', 2490],
  [23, 'Клавиатура Volt Keys Pro', 'Аксессуары', 8990], [24, 'Пауэрбанк Volt Power 20000', 'Аксессуары', 4290],
];
const price = Object.fromEntries(products.map((p) => [p[0], p[3]]));

// ---------- customers ----------
const male = ['Александр', 'Дмитрий', 'Максим', 'Артём', 'Никита', 'Иван', 'Егор', 'Андрей', 'Алексей', 'Роман'];
const female = ['Анастасия', 'Екатерина', 'Дарья', 'Полина', 'Виктория', 'Ксения', 'Алина', 'Юлия', 'Софья', 'Вера'];
const last = ['Иванов', 'Петров', 'Сидоров', 'Фёдоров', 'Михайлов', 'Алексеев', 'Яковлев', 'Григорьев', 'Степанов', 'Николаев',
  'Захаров', 'Зайцев', 'Павлов', 'Семёнов', 'Голубев', 'Виноградов', 'Богданов', 'Воробьёв', 'Тарасов', 'Комаров'];
const cities = ['Москва', 'Москва', 'Санкт-Петербург', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород'];
// all surnames in the list end in -ов/-ёв/-ев: the feminine form adds -а
const used = new Set();
const customers = [];
for (let id = 1; id <= 60; id++) {
  let name;
  do { const isF = rnd() < 0.5; name = (isF ? pick(female) : pick(male)) + ' ' + pick(last) + (isF ? 'а' : ''); } while (used.has(name));
  used.add(name);
  const email = rnd() < 0.13 ? null : `user${id}@mail.example`;
  customers.push([id, name, pick(cities), email, day(int(-400, 200))]);
}
// accomplice: customer 47, recent signup, no email
customers[46] = [47, 'Денис Лапин', 'Казань', null, '2025-05-02'];
// three customers who never ordered: late sign-ups
for (const id of [58, 59, 60]) customers[id - 1][4] = day(int(330, 360));

// ---------- orders + items ----------
const orders = [], items = [];
let oid = 1001;
const orderTotal = {};
function addOrder(cid, d, status, lines) {
  const id = oid++;
  orders.push([id, cid, day(d), status]);
  let total = 0;
  for (const [pid, qty] of lines) { items.push([id, pid, qty, price[pid]]); total += qty * price[pid]; }
  orderTotal[id] = total;
  return id;
}
for (let cid = 1; cid <= 57; cid++) {
  if (cid === 47) continue;
  const signup = Math.max(0, Math.round((Date.parse(customers[cid - 1][4]) - Date.UTC(2025, 0, 1)) / 86400000));
  const n = int(2, 11);
  for (let k = 0; k < n; k++) {
    const d = int(signup, 364);
    const r = rnd();
    const status = d > 350 ? 'shipped' : r < 0.82 ? 'delivered' : r < 0.91 ? 'cancelled' : 'returned';
    const lines = [];
    const m = rnd() < 0.6 ? 1 : int(2, 3);
    const seen = new Set();
    while (lines.length < m) { const pid = int(1, 24); if (seen.has(pid)) continue; seen.add(pid); lines.push([pid, pid >= 19 ? int(1, 3) : 1]); }
    addOrder(cid, d, status, lines);
  }
}
// accomplice orders: delivered, then "refunded" by Kirill
const accompliceOrders = [];
for (const [d, lines] of [[138, [[6, 1]]], [171, [[2, 1]]], [205, [[17, 1], [20, 1]]], [236, [[11, 1]]], [262, [[8, 1]]], [290, [[15, 1]]]]) {
  accompliceOrders.push(addOrder(47, d, 'delivered', lines));
}
orders.sort((a, b) => a[2].localeCompare(b[2]) || a[0] - b[0]);

// ---------- refunds ----------
const refunds = [];
let rid = 1;
const support = [2, 3, 4, 6, 2, 3, 4];
for (const [id, , date, status] of orders) {
  if (status !== 'returned') continue;
  const share = rnd() < 0.7 ? 1 : Math.round(int(50, 95)) / 100;
  const amount = Math.round(orderTotal[id] * share);
  const rd = new Date(Date.parse(date) + int(3, 18) * 86400000).toISOString().slice(0, 10);
  refunds.push([rid++, id, rd, amount, pick(support)]);
}
// Kirill's fraud: refunds larger than the order total, on delivered orders of the accomplice
for (const id of accompliceOrders) {
  const date = orders.find((o) => o[0] === id)[2];
  const rd = new Date(Date.parse(date) + int(4, 9) * 86400000).toISOString().slice(0, 10);
  refunds.push([rid++, id, rd, Math.round(orderTotal[id] * 1.35), 6]);
}
// ... and refunds for orders that do not exist
for (const [ghost, d, amount] of [[9001, 250, 64990], [9002, 281, 118990], [9003, 318, 87990]]) {
  refunds.push([rid++, ghost, day(d), amount, 6]);
}
refunds.sort((a, b) => a[2].localeCompare(b[2]));
refunds.forEach((r, i) => { r[0] = i + 1; });

// ---------- HAVING threshold: between the top-1 and top-2 refund sums ----------
const sums = {};
for (const r of refunds) sums[r[4]] = (sums[r[4]] || 0) + r[3];
const sorted = Object.values(sums).sort((a, b) => b - a);
const threshold = Math.ceil((sorted[0] + sorted[1]) / 2 / 10000) * 10000;

// ---------- SQL ----------
const schemaSql = `
CREATE TABLE employees (employee_id INTEGER PRIMARY KEY, full_name TEXT, role TEXT, hired_on TEXT);
CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, full_name TEXT, city TEXT, email TEXT, signup_date TEXT);
CREATE TABLE products (product_id INTEGER PRIMARY KEY, name TEXT, category TEXT, price INTEGER);
CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT, status TEXT);
CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, quantity INTEGER, unit_price INTEGER);
CREATE TABLE refunds (refund_id INTEGER PRIMARY KEY, order_id INTEGER, refund_date TEXT, amount INTEGER, approved_by INTEGER);`.trim();
const ins = (t, rows) => rows.map((r) => `INSERT INTO ${t} VALUES (${r.map(q).join(', ')});`).join('\n');
const seedSql = [ins('employees', employees), ins('customers', customers), ins('products', products),
  ins('orders', orders), ins('order_items', items), ins('refunds', refunds)].join('\n');

const tables = [
  { name: 'employees', about: 'Сотрудники магазина', rows: employees.length, columns: [
    ['employee_id', 'INTEGER', 'id сотрудника'], ['full_name', 'TEXT', 'имя'], ['role', 'TEXT', 'должность'], ['hired_on', 'TEXT', 'дата найма, YYYY-MM-DD']] },
  { name: 'customers', about: 'Клиенты', rows: customers.length, columns: [
    ['customer_id', 'INTEGER', 'id клиента'], ['full_name', 'TEXT', 'имя'], ['city', 'TEXT', 'город'],
    ['email', 'TEXT', 'email, может быть NULL'], ['signup_date', 'TEXT', 'дата регистрации']] },
  { name: 'products', about: 'Товары', rows: products.length, columns: [
    ['product_id', 'INTEGER', 'id товара'], ['name', 'TEXT', 'название'], ['category', 'TEXT', 'категория'], ['price', 'INTEGER', 'цена, ₽']] },
  { name: 'orders', about: 'Заказы за 2025 год', rows: orders.length, columns: [
    ['order_id', 'INTEGER', 'id заказа'], ['customer_id', 'INTEGER', '→ customers.customer_id'], ['order_date', 'TEXT', 'дата заказа'],
    ['status', 'TEXT', "'delivered', 'shipped', 'cancelled' или 'returned'"]] },
  { name: 'order_items', about: 'Строки заказов', rows: items.length, columns: [
    ['order_id', 'INTEGER', '→ orders.order_id'], ['product_id', 'INTEGER', '→ products.product_id'],
    ['quantity', 'INTEGER', 'количество'], ['unit_price', 'INTEGER', 'цена за штуку в заказе, ₽']] },
  { name: 'refunds', about: 'Возвраты денег', rows: refunds.length, columns: [
    ['refund_id', 'INTEGER', 'id возврата'], ['order_id', 'INTEGER', '→ orders.order_id'], ['refund_date', 'TEXT', 'дата возврата'],
    ['amount', 'INTEGER', 'сумма возврата, ₽'], ['approved_by', 'INTEGER', '→ employees.employee_id']] },
];

const tasks = TASKS({ threshold });
const ids = new Set(tasks.map((t) => t.id));
if (ids.size !== tasks.length) throw new Error('duplicate task ids');

const out = { version: 1, schemaSql, seedSql, tables, tasks };
fs.writeFileSync('11_sql/sql-course-data.js',
  '// Generated by scripts/sql-course/build.mjs - do not edit by hand.\n' +
  'window.__mlSqlCourse = ' + JSON.stringify(out) + ';\n');
console.log(`SQL course data: ${tasks.length} tasks; rows: orders ${orders.length}, items ${items.length}, refunds ${refunds.length}; HAVING threshold ${threshold}`);

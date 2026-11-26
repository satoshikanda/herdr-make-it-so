// Derived from Josef Kuepker’s MIT-licensed herdr-layouts implementation. See LICENSE and SOURCES.md.
// Workspace: no network, filesystem, shell, or third-party integrations.
// Make it so draws the workspace frame. One mod draws every part; the layout says which with props().part:
// "top" (the upper elbow, arm and title), "side" (spaces and crew as labeled blocks), "tabs" (the tab pills)
// and "bottom" (the lower elbow and the status arm). As a popup it is "machines" (where a new space goes).
// Right-clicks open Herdr's own menu mod, so rename, close, split and worktrees work as in its other layouts.
import { View, div, svg } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { spaces, agents, machines, run, props, setAgentOrder, window, openOverlay, closeOverlay } from "herdr";

const C = {
  black: "#000000", orange: "#ff9900", peach: "#ff9966", gold: "#ffcc66", tan: "#ffcc99", lilac: "#cc99cc",
  violet: "#9999ff", blue: "#99ccff", sky: "#5599ff", red: "#ff5544", gray: "#666688", plum: "#6c4f79", cream: "#ffcc99", pale: "#e6bfe6",
};
const SPACE_COLORS = [C.tan, C.lilac, C.peach, C.blue, C.violet];
const STATUS = { working: C.blue, blocked: C.red, done: C.gold, idle: C.violet };
const WORD = { working: "WORKING", blocked: "NEEDS YOU", done: "DONE", idle: "STANDING BY" };
const SIDE = 188; // the sidebar's width, which the elbows match
const ARM = 18; // the thickness of the horizontal arms
const GAP = 5; // black between color blocks

const up = (s) => String(s ?? "").toUpperCase();
const two = (n) => String(n).padStart(2, "0");

// a block of color with a black label set in its bottom-right corner
function slab(id, color, label, h, extra) {
  let el = div().id(id).w_full().h(h).flex_none().bg(color).flex().items_end().justify_end().px(10).pb(2)
    .text_color(C.black).text_size(15).font_weight(700).child(up(label));
  return extra ? extra(el) : el;
}

// Herdr's menu mod at the pointer: tab is "space", "tab", "pane" or "global"
const menu = (tab, target) => openOverlay({ mod: "menu", kind: "popup", width: 200, height: 260, props: { tab, target } });
// Herdr's new menu: a terminal, each installed agent, a new space, worktrees
const newMenu = () => openOverlay({ mod: "new-menu", kind: "popup", width: 250, height: 512 });
// a right-click handler that opens one menu; stopping the press keeps the bar behind from opening its own
const onRight = (open) => (_e, cx) => { cx.stop_propagation(); open(); };
const globalMenu = () => menu("global", {});
// where a new space goes, when there is more than this computer
function newSpace() {
  const away = machines().filter((m) => m.name);
  if (!away.length && machines().some((m) => !m.name && m.layout === "ready")) return run("space.new", {});
  openOverlay({ mod: "make-it-so", kind: "popup", width: 230, height: Math.min(500, 60 + 44 * (away.length + 1)),
    frame: "none", props: { part: "machines" } });
}

export default class MakeItSo extends View {
  init(_props, cx) {
    this.now = Date.now();
    const part = _props?.part ?? props()?.part ?? "top";
    if (part === "top" || part === "bottom")
      cx.timer.every(15000, (cx) => { this.now = Date.now(); cx.notify(); });
  }

  render() {
    const part = props()?.part ?? "top";
    if (part === "top") return this.top();
    if (part === "side") return this.side();
    if (part === "tabs") return this.tabs();
    if (part === "bottom") return this.bottom();
    if (part === "machines") return this.machines();
    return div().child(`make-it-so: unknown part ${part}`);
  }

  machines() {
    const close = () => closeOverlay(props()?.overlay);
    const connected = machines();
    const local = connected.find((m) => !m.name) ?? { name: null, layout: "unavailable" };
    const all = [local, ...connected.filter((m) => m.name)];
    const row = (m, i) => {
      const ready = m.layout === "ready";
      return slab(`new-space-${m.name ?? "local"}`, ready ? SPACE_COLORS[i % SPACE_COLORS.length] : C.gray,
        `${m.name ?? "this computer"}${ready ? "" : " · " + m.layout}`, 40, (el) => el
          .when(ready, (el) => el.cursor_pointer().hover((st) => st.opacity(0.85))
            .on_click(() => { close(); run("space.new", m.name ? { machine: m.name } : {}); })));
    };
    return v_flex().id("machines").size_full().bg(C.black).rounded(14).p(6).gap(GAP).overflow_y_scrollbar()
      .child(slab("new-space-title", C.orange, "new space on", 30, (el) => el.rounded_tl(12).rounded_tr(12)))
      .children(all.map(row));
  }

  top() {
    const space = spaces().find((s) => s.active);
    const w = window();
    const control = (name, icon) => div().id(`window-${name}`).w(28).h(24)
      .flex_none().flex().items_center().justify_center().cursor_pointer()
      .text_color(C.tan).hover((st) => st.bg(name === "close" ? C.red : C.gray))
      .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
      .on_click(() => run(`window.${name}`))
      .child(svg(`mods/make-it-so/${icon}.svg`).size(14));
    const all = spaces();
    const tabs = (space?.tabs ?? []).filter(t => !t.settled);
    const date = new Date(this.now);
    const day = `${date.getFullYear()} / ${two(date.getMonth()+1)} / ${two(date.getDate())}`;
    const elbow = div().w(SIDE).h_full().flex_none().bg(C.tan).rounded_tl(58)
      .flex().items_end().justify_end().px(12).pb(7).text_color(C.black).text_size(18).font_weight(700)
      .child(up(space?.machine ?? "LOCAL COMPUTER"));
    const arm = h_flex().w_full().h(ARM).flex_none().gap(GAP)
      .child(div().w(124).h_full().bg(C.tan))
      .child(div().w(58).h_full().bg(C.lilac))
      .child(div().w(24).h_full().bg(C.orange))
      .child(div().flex_1().h_full().bg(C.gray))
      .child(div().w(130).h_full().bg(C.tan).flex().items_center().justify_end().pr(10)
        .text_color(C.black).text_size(12).child(day))
      .child(div().w(26).h_full().bg(C.tan).rounded_r(10));
    const matrix = (label, value, color) => v_flex().gap(1).w(66).flex_none()
      .child(div().text_color(color).text_size(28).child(two(value)))
      .child(div().text_color(C.lilac).text_size(11).child(label));
    // Broad outside elbow, a deeply inset inside corner, and thin parallel baseline.
    const title = div().w_full().flex_1().bg(C.tan).child(
      v_flex().size_full().bg(C.black).rounded_tl(38).pl(26).pr(8).pt(9).gap(4)
        .child(h_flex().w_full().items_center().gap(16)
          .child(v_flex().flex_1().min_w(0)
            .child(div().text_color(C.tan).text_size(14).child("Make it so"))
            .child(div().text_color(C.orange).text_size(34).font_weight(700).truncate()
              .child(up(space?.name ?? "COMMAND INTERFACE"))))
          .child(matrix("SPACES", all.length, C.tan))
          .child(matrix("TABS", tabs.length, C.lilac))
          .when(w?.buttons, (el) => el.child(h_flex().gap(2).flex_none()
            .child(control("minimize", "minimize"))
            .child(control("maximize", w.maximized ? "restore" : "maximize"))
            .child(control("close", "close")))))
        .child(h_flex().w_full().h(3).gap(GAP)
          .child(div().w(72).h_full().bg(C.orange))
          .child(div().w(26).h_full().bg(C.lilac))
          .child(div().flex_1().h_full().bg(C.plum))));
    return h_flex().id("top").size_full().bg(C.black).on_mouse_down("right", onRight(globalMenu))
      .child(elbow)
      .child(v_flex().flex_1().h_full().child(arm).child(title));
  }

  side() {
    const list = spaces();
    const crew = agents();
    setAgentOrder(crew.map((a) => a.address));
    const space = (s, i) => {
      const color = s.active ? C.orange : s.status === "blocked" ? C.red : SPACE_COLORS[i % SPACE_COLORS.length];
      return h_flex().id(`space-${s.id}`).w_full().h(44).flex_none().bg(color).items_end().justify_between().px(10).pb(2)
        .text_color(C.black).font_weight(700).cursor_pointer()
        .hover((st) => st.opacity(0.85))
        .when(s.status === "blocked" && !s.active, (el) => el.loop("opacity", { from: 0.55, to: 1, period: 900 }))
        .on_click(() => run("space.select", { id: s.id }))
        .on_mouse_down("right", onRight(() => menu("space", { id: s.id })))
        .child(div().text_size(22).child(`${two(s.index)}${s.machine ? "-" + up(s.machine) : ""}`))
        .child(div().text_size(18).truncate().child(up(s.name)));
    };
    const member = (a) => h_flex().id(`agent-${a.address}`).w_full().h(40).flex_none().gap(6).items_center()
      .cursor_pointer().hover((st) => st.opacity(0.85))
      .on_click(() => run("agent.focus", { terminal: a.address }))
      .on_mouse_down("right", onRight(() => menu("pane", { pane: a.pane, terminal: a.address })))
      .child(div().w(14).h_full().bg(STATUS[a.status] ?? C.gray).rounded_l(15)
        .when(a.status === "blocked", (el) => el.loop("opacity", { from: 0.4, to: 1, period: 700 })))
      .child(v_flex().flex_1().min_w(0)
        .child(div().text_size(13).font_weight(700).text_color(a.focused ? C.orange : C.tan).truncate()
          .child(up(`${a.program?.name ?? a.app ?? "agent"} · ${a.tab_name}`)))
        .child(div().text_size(11).text_color(STATUS[a.status] ?? C.gray).truncate()
          .child(`${WORD[a.status] ?? up(a.status)} · ${up(a.space_name)}`)));
    const active = list.find(s => s.active);
    const tabs = (active?.tabs ?? []).filter(t => !t.settled);
    const connections = machines();
    const dataRow = (label, value, color) => h_flex().w_full().h(28).gap(GAP).items_center()
      .child(div().w(14).h_full().bg(color).rounded_l(14))
      .child(div().flex_1().text_size(13).text_color(color).child(label))
      .child(div().w(44).h_full().bg(color).flex().justify_end().items_center().pr(7)
        .text_color(C.black).text_size(20).child(two(value)));
    return v_flex().id("side").size_full().bg(C.black).gap(GAP).overflow_y_scrollbar().on_mouse_down("right", onRight(globalMenu))
      .child(slab("spaces-label", C.tan, `01 / OPERATIONS`, 28))
      .children(list.map(space))
      .child(slab("space-new", C.lilac, "+ new space", 34, (el) => el.cursor_pointer()
        .hover((st) => st.bg(C.violet)).on_click(() => newSpace()).on_mouse_down("right", onRight(newSpace))))
      .child(div().w_full().h(14).flex_none().bg(C.black))
      .child(slab("crew-label", C.lilac, `02 / CREW ${two(crew.length)}`, 30))
      .child(v_flex().id("crew").w_full().flex_none().gap(4).pr(4).children(crew.map(member))
        .when(!crew.length, el=>el.child(h_flex().w_full().h(48).gap(12)
          .child(div().w(16).h_full().bg(C.plum))
          .child(v_flex().justify_center().gap(2)
            .child(div().text_size(16).text_color(C.lilac).child("NO AGENTS ATTACHED"))
            .child(div().text_size(11).text_color(C.gray).child("TERMINALS REMAIN AVAILABLE"))))))
      .child(h_flex().w_full().flex_1().min_h(32).gap(GAP)
        .child(div().w(16).h_full().bg(C.plum))
        .child(div().flex_1().bg(C.black)))
      .child(slab("session-index", C.tan, "03 / SESSION INDEX", 28))
      .child(v_flex().w_full().flex_none().gap(GAP)
        .child(dataRow("OPEN SPACES", list.length, C.tan))
        .child(dataRow("ACTIVE SPACE TABS", tabs.length, C.lilac))
        .child(dataRow("ATTACHED AGENTS", crew.length, C.peach))
        .child(dataRow("READY HOSTS", connections.filter(m=>m.layout === "ready").length, C.blue)))
      .child(div().w_full().h(15).flex_none().bg(C.plum));
  }

  tabs() {
    const space = spaces().find((s) => s.active);
    const pill = (t) => {
      const color = t.active ? C.orange : STATUS[t.status] ?? C.tan;
      return h_flex().id(`tab-${t.id}`).h_full().flex_none().px(19).rounded_r(16).bg(color).items_center()
        .text_color(C.black).text_size(18).font_weight(700).cursor_pointer()
        .hover((st) => st.opacity(0.85))
        .when(t.status === "blocked" && !t.active, (el) => el.loop("opacity", { from: 0.5, to: 1, period: 800 }))
        .on_click(() => run("tab.select", { id: t.id }))
        .on_mouse_down("right", onRight(() => menu("tab", { id: t.id, space: space.id })))
        .child(`${two(t.index)} ${up(t.name)}`);
    };
    return h_flex().id("tab-bar").size_full().gap(GAP + 2).items_center().overflow_x_scrollbar()
      .on_mouse_down("right", onRight(globalMenu))
      .children((space?.tabs ?? []).filter((t) => !t.settled).map(pill))
      .child(h_flex().id("tab-new").h_full().flex_none().px(14).rounded(15).bg(C.gray).items_center()
        .text_color(C.black).text_size(22).font_weight(700).cursor_pointer().hover((st) => st.bg(C.violet))
        .on_click(() => newMenu()).on_mouse_down("right", onRight(newMenu)).child("+"))
      .child(div().flex_1().min_w(20).h(7).bg(C.plum))
      .child(div().w(20).h(7).flex_none().bg(C.lilac))
      .child(div().text_size(14).text_color(C.tan).flex_none().child("TERMINAL MATRIX"))
      .child(div().w(32).h(7).flex_none().bg(C.orange).rounded_r(5));
  }

  bottom() {
    const crew = agents();
    const count = (s) => crew.filter((a) => a.status === s).length;
    const hostCount = machines().length;
    const clock = new Date(this.now).toTimeString().slice(0, 5);
    const elbow = div().id("menu").w(SIDE).h_full().flex_none().bg(C.gray).rounded_bl(48)
      .flex().items_start().justify_end().px(10).pt(4).text_color(C.black).text_size(13).font_weight(700)
      .cursor_pointer().hover((st) => st.bg(C.violet)).on_click(() => menu("global", {}))
      .child(h_flex().gap(10).items_center()
        // the gear opens Herdr's settings; stopping its press keeps the elbow's MENU from opening too
        .child(div().id("settings").cursor_pointer().hover((st) => st.opacity(0.6))
          .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
          .on_mouse_down("right", (_e, cx) => cx.stop_propagation())
          .on_click(() => run("app.settings"))
          .child(div().text_size(11).child("SET")))
        .child("MENU"));
    const status = div().w_full().flex_1().bg(C.gray).child(
      h_flex().size_full().bg(C.black).rounded_bl(30).items_center().gap(20).pl(22).text_size(17).font_weight(700)
        .child(div().text_color(C.blue).child(`${two(count("working"))} WORKING`))
        .child(div().text_color(count("blocked") ? C.red : C.gray).child(`${two(count("blocked"))} NEED YOU`))
        .child(div().text_color(C.gold).child(`${two(count("done"))} DONE`))
        .child(div().text_color(C.lilac).child(`${two(hostCount)} HOSTS`))
        .child(div().flex_1())
        .child(div().id("palette").text_color(C.tan).cursor_pointer().on_click(() => run("app.palette"))
          .child(`${window()?.platform === "macos" ? "⌘" : "CTRL"} SHIFT P · ${clock}`)));
    const arm = h_flex().w_full().h(18).flex_none().gap(GAP)
      .child(div().w(120).h_full().bg(C.gray))
      .child(div().flex_1().h_full().bg(C.plum))
      .child(div().w(90).h_full().bg(C.tan))
      .child(div().w(20).h_full().bg(C.lilac))
      .child(div().w(46).h_full().bg(C.orange).rounded_tr(8).rounded_br(8));
    return h_flex().id("bottom").size_full().bg(C.black).on_mouse_down("right", onRight(globalMenu))
      .child(elbow)
      .child(v_flex().flex_1().h_full().child(status).child(arm));
  }
}


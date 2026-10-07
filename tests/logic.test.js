import{describe,it,expect}from'vitest';
import{calculateXP,levelInfo,calculateStreak,longestStreak,completionRate,qualifyingDays,buildFacts,localInsights,ago}from'../src/logic.js';
import{validateInsights}from'../src/validate.js';
const now=new Date(2026,9,6,12),d=n=>ago(n,now);
const habits=[{name:'Gym',xp:30,done:[d(0),d(1),d(2),d(8)]},{name:'Read',xp:15,done:[d(1)]}];
describe('xp & levels',()=>{
 it('sums XP',()=>expect(calculateXP(habits)).toBe(4*30+15));
 it('level 1 at 0 XP',()=>expect(levelInfo(0)).toEqual({level:1,into:0,cost:140,left:140}));
 it('levels up exactly at the boundary',()=>{expect(levelInfo(139).level).toBe(1);expect(levelInfo(140).level).toBe(2)});
});
describe('streaks',()=>{
 it('counts consecutive days incl. today',()=>expect(calculateStreak([d(0),d(1),d(2),d(4)],now)).toBe(3));
 it('keeps streak alive if today not yet done',()=>expect(calculateStreak([d(1),d(2)],now)).toBe(2));
 it('is 0 after a gap',()=>expect(calculateStreak([d(3)],now)).toBe(0));
 it('finds longest run',()=>expect(longestStreak([d(10),d(9),d(8),d(1)])).toBe(3));
 it('computes 30-day rate',()=>expect(completionRate([d(0),d(1),d(2)],30,now)).toBeCloseTo(0.1));
 it('flags days with at least half the habits',()=>expect(qualifyingDays(habits)).toEqual(expect.arrayContaining([d(1),d(0)])));
});
describe('facts & fallback',()=>{
 it('builds facts and local insights that pass validation',()=>{const f=buildFacts(habits,now);expect(validateInsights(localInsights(f),f)).not.toBeNull()});
 it('returns no insights without habits',()=>expect(localInsights(buildFacts([],now))).toEqual([]));
});
import{isValidHabits,seedHabits}from'../src/logic.js';
describe('storage helpers',()=>{
 it('accepts well-formed habits',()=>expect(isValidHabits(seedHabits(now))).toBe(true));
 it('rejects malformed habits',()=>{expect(isValidHabits([{id:1}])).toBe(false);expect(isValidHabits(null)).toBe(false)});
 it('seed leaves today open',()=>expect(seedHabits(now).some(h=>h.done.includes(ago(0,now)))).toBe(false));
});

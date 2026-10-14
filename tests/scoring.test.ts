import {describe,expect,it} from 'vitest';
import {cleanAlias,isCorrect,levels,scoreAnswer,totalScore,type AnswerRecord} from '../src/lib/game';

describe('reglas del juego',()=>{
  it('implementa exactamente diez niveles con respuesta válida',()=>{
    expect(levels).toHaveLength(10);
    levels.forEach(l=>expect(isCorrect(l.id,l.correct)).toBe(true));
  });
  it('no da puntos por error ni puntajes negativos',()=>{
    expect(scoreAnswer(1,'incorrecto',1)).toBe(0);
    expect(scoreAnswer(10,'incorrecto',999)).toBe(0);
  });
  it('limita la bonificación para que la velocidad no domine',()=>{
    expect(scoreAnswer(1,levels[0].correct,0)-scoreAnswer(1,levels[0].correct,120)).toBe(30);
  });
  it('rechaza una partida incompleta o con niveles duplicados',()=>{
    expect(totalScore([])).toBe(0);
    const duplicate=Array.from({length:10},()=>({levelId:1,answer:levels[0].correct,elapsedSeconds:1}));
    expect(totalScore(duplicate)).toBe(0);
  });
  it('calcula una partida completa',()=>{
    const records:AnswerRecord[]=levels.map(l=>({levelId:l.id,answer:l.correct,elapsedSeconds:30}));
    expect(totalScore(records)).toBe(1690);
  });
  it('sanea y limita alias',()=>expect(cleanAlias('  <b> Ana   Mecánica 123456789 </b> ')).not.toMatch(/[<>]/));
});

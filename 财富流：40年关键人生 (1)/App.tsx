
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Zap, 
  TrendingUp, 
  Clock,
  Award,
  ReceiptText,
  Rocket,
  ArrowRight,
  BrainCircuit,
  Info
} from 'lucide-react';
import { GameNode, PlayerStats, DecisionOption } from './types';

const App: React.FC = () => {
  const initialStats: PlayerStats = {
    age: 22,
    monthlyIncome: 0,
    passiveIncome: 0,
    monthlyExpenses: 0,
    cash: 20000,
    energy: 10,
    energyMax: 10,
    riskValue: 0,
    careerPath: '',
    decisions: []
  };

  const [gameState, setGameState] = useState<GameNode>(GameNode.INTRO);
  const [stats, setStats] = useState<PlayerStats>(initialStats);

  const [isTimeJumping, setIsTimeJumping] = useState(false);
  const [jumpTargetAge, setJumpTargetAge] = useState(0);
  const [jumpReport, setJumpReport] = useState<{lost: number, reason: string, actualGained: number} | null>(null);
  const [cashPop, setCashPop] = useState(false);

  // 动画反馈
  useEffect(() => {
    setCashPop(true);
    const timer = setTimeout(() => setCashPop(false), 300);
    return () => clearTimeout(timer);
  }, [stats.cash]);

  const formatMoney = (val: number) => {
    const absVal = Math.abs(val);
    if (absVal >= 100000000) return `${(val / 100000000).toFixed(2)}亿`;
    if (absVal >= 10000) return `${(val / 10000).toFixed(1)}万`;
    return Math.floor(val).toLocaleString();
  };

  const triggerTimeJump = useCallback((years: number, nextNode: GameNode, currentStats: PlayerStats) => {
    setIsTimeJumping(true);
    setJumpTargetAge(currentStats.age + years);
    
    const monthlySurplus = currentStats.monthlyIncome + currentStats.passiveIncome - currentStats.monthlyExpenses;
    const theoreticalSavings = monthlySurplus * 12 * years;
    const friction = 0.7 + Math.random() * 0.2;
    const actualGained = Math.max(0, theoreticalSavings * friction);
    const lost = theoreticalSavings - actualGained;

    const reasons = ["电子产品更新", "朋友聚会/份子钱", "医疗健康", "通胀损耗", "情绪化消费"];
    const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
    
    setJumpReport({ lost, reason: randomReason, actualGained });

    setTimeout(() => {
      setStats(prev => ({ 
        ...prev, 
        age: prev.age + years, 
        cash: prev.cash + actualGained,
        energy: Math.min(prev.energyMax, prev.energy + (years > 1 ? 2 : 1))
      }));
      setGameState(nextNode);
      setIsTimeJumping(false);
      setJumpReport(null);
    }, 2200);
  }, []);

  const handleDecision = (option: DecisionOption, nextNode: GameNode, jumpYears: number = 1) => {
    setStats(prev => {
      const updated = option.impact(prev);
      updated.decisions = [...prev.decisions, option.title];
      
      if (nextNode !== GameNode.GAME_OVER) {
        requestAnimationFrame(() => triggerTimeJump(jumpYears, nextNode, updated));
      } else {
        setGameState(GameNode.GAME_OVER);
      }
      return updated;
    });
  };

  const resetGame = () => {
    setStats(initialStats);
    setGameState(GameNode.NODE_1); // 直接跳到第一个决策点，体现“带着认知重来”
  };

  const passiveRatio = useMemo(() => {
    if (stats.monthlyExpenses <= 0) return 0;
    return Math.floor((stats.passiveIncome / stats.monthlyExpenses) * 100);
  }, [stats.passiveIncome, stats.monthlyExpenses]);

  // --- 画像解析引擎 ---
  const lifeProfile = useMemo(() => {
    const { decisions, riskValue, energy, passiveIncome, monthlyIncome } = stats;
    const pr = passiveRatio;

    if (decisions.includes("推倒重来")) {
      return {
        title: "看懂但来不及型",
        tags: ["通透", "迟到", "够用"],
        desc: "你已经非常清楚人生的运行规则，只是这些理解，来得有点晚。你不再焦虑，也不再幻想。如果重来一次，你会做得更好。但这一局，你选择接受。"
      };
    }
    if (decisions.includes("贷款买房") && decisions.includes("组建家庭") && pr < 100) {
      return {
        title: "被锁死的人生",
        tags: ["表面稳定", "低自由度", "隐性风险"],
        desc: "你很早就做出了“正确选择”。房子、家庭、责任，一切都有了。但也正因为这样，你失去了重新选择的能力。你不是失败，只是太早把人生写成了定稿。"
      };
    }
    if (pr >= 100 && riskValue > 40) {
      return {
        title: "自由但脆弱",
        tags: ["不安全感", "掌控时间", "无护栏"],
        desc: "你拥有很多人羡慕的自由，也承担着他们看不到的不安。你的人生没有天花板，但也没有护栏。你每天都在为选择负责，这是你最骄傲的地方，也是你最大的压力。"
      };
    }
    if (energy <= 2 && (monthlyIncome + passiveIncome) > 20000) {
      return {
        title: "高压成长型",
        tags: ["持续增长", "长期透支", "搏杀"],
        desc: "你的人生靠一连串高强度选择支撑。你赢过几次关键节点，但几乎没有真正停下来过。你知道自己在向上走，只是偶尔会怀疑：如果哪天停下来，你还剩下什么。"
      };
    }
    if (pr >= 50 && riskValue <= 30) {
      return {
        title: "认知跃迁型",
        tags: ["不断修正", "清醒", "稳步走高"],
        desc: "你并不是赢在起点，而是赢在“不断修正”。你的人生没有一次决定性飞跃，但每一次选择，都比上一次更清醒。你可能不是最耀眼的那一个，但你很少走回头路。"
      };
    }
    if (decisions.includes("自由探索 / 创业尝试") && (monthlyIncome > 15000)) {
      return {
        title: "晚醒型人生",
        tags: ["后置成长", "找回方向", "晚点起跑"],
        desc: "你的人生前半段平稳，后半段才开始认真思考“我想要什么”。你会比别人晚一点开始奔跑，但你终于知道方向了。如果时间再多一点，你的人生也许会完全不同。"
      };
    }
    if (riskValue > 50) {
      return {
        title: "反复横跳型",
        tags: ["波动", "勇气", "未画完的线"],
        desc: "你尝试过很多方向，也放弃过很多可能。你不缺勇气，缺的是一次足够长时间的坚持。你的人生像一条未画完的线，方向很多，但没有一条走得足够远。"
      };
    }
    return {
      title: "稳定型人生",
      tags: ["可预测", "极低风险", "无起伏"],
      desc: "你很少做错误决定，但也几乎没有“超出预期”的收获。你的人生没有大起伏，代价是：很多可能性，在你还没试之前就被排除了。你并不后悔，只是偶尔会想：如果当初再大胆一点，会不会不一样。"
    };
  }, [stats, passiveRatio]);

  // --- 节点定义 ---
  const nodes: Record<number, { q: string, sub: string, options: DecisionOption[], next: GameNode, jump: number }> = {
    [GameNode.NODE_1]: {
      q: "22岁 · 第一份工作",
      sub: "毕业即入世，这决定了你最初的原始积累模式。",
      next: GameNode.NODE_2,
      jump: 1,
      options: [
        { title: "进入一线城市大厂", description: "高压高薪，成长极快，但个人生活几乎被吞噬。", impact: s => ({ ...s, monthlyIncome: 15000, monthlyExpenses: 9000, energyMax: 8, careerPath: '大厂精英' }) },
        { title: "去一家普通公司", description: "收入尚可，节奏正常，成长路径相对清晰且缓慢。", impact: s => ({ ...s, monthlyIncome: 7000, monthlyExpenses: 3500, energyMax: 10, careerPath: '职场稳定派' }) },
        { title: "自由探索 / 创业尝试", description: "收入极不稳定，但时间属于自己，充满未知。", impact: s => ({ ...s, monthlyIncome: 4000, monthlyExpenses: 2500, energyMax: 12, careerPath: '自由灵魂' }) }
      ]
    },
    [GameNode.NODE_2]: {
      q: "23岁 · 收入第一次提升",
      sub: "手头开始宽裕，你打算如何处理这笔结余？",
      next: GameNode.NODE_3,
      jump: 2,
      options: [
        { title: "提升生活质量", description: "换更好的公寓，购买心仪已久的装备。", impact: s => ({ ...s, monthlyExpenses: s.monthlyExpenses + 2000, energy: s.energy + 1 }) },
        { title: "投资自己", description: "购买专业课程，考取高价值证书。", impact: s => ({ ...s, cash: s.cash - 10000, monthlyIncome: s.monthlyIncome + 3000, energy: s.energy - 2 }) },
        { title: "尽量存钱", description: "保持克制，为不确定的未来挖掘第一桶金。", impact: s => s }
      ]
    },
    [GameNode.NODE_3]: {
      q: "25岁 · 资产锁定诱惑",
      sub: "同龄人开始买房，你感到了前所未有的压力。",
      next: GameNode.NODE_4,
      jump: 1,
      options: [
        { title: "贷款买房", description: "背负长期负债，换取城市的归属感。", impact: s => ({ ...s, cash: s.cash - 50000, monthlyExpenses: s.monthlyExpenses + 4000, riskValue: s.riskValue + 20 }) },
        { title: "继续租房", description: "保持现金流的流动性，寻找其他机会。", impact: s => s },
        { title: "回老家发展", description: "大幅降低生活成本，但机会也随之减少。", impact: s => ({ ...s, monthlyIncome: s.monthlyIncome * 0.7, monthlyExpenses: s.monthlyExpenses * 0.4 }) }
      ]
    },
    [GameNode.NODE_4]: {
      q: "26岁 · 职业瓶颈期",
      sub: "工作变得机械枯燥，向上空间似乎触到了天花板。",
      next: GameNode.NODE_5,
      jump: 2,
      options: [
        { title: "忍一忍，等机会", description: "相信职场积累，等待公司内部的变动。", impact: s => ({ ...s, energy: s.energy - 1 }) },
        { title: "主动跳槽", description: "承担风险跳入新赛道，争取薪资跃迁。", impact: s => ({ ...s, monthlyIncome: s.monthlyIncome + 5000, monthlyExpenses: s.monthlyExpenses + 1000, riskValue: s.riskValue + 10 }) },
        { title: "开启副业", description: "利用业余时间探索第二曲线。", impact: s => ({ ...s, passiveIncome: s.passiveIncome + 2000, energy: s.energy - 3 }) }
      ]
    },
    [GameNode.NODE_5]: {
      q: "28岁 · 人生锁死点",
      sub: "家庭、事业、自我的平衡题摆在了面前。",
      next: GameNode.NODE_6,
      jump: 2,
      options: [
        { title: "组建家庭", description: "责任增加，生活重心彻底转向稳定。", impact: s => ({ ...s, energyMax: s.energyMax - 2, monthlyExpenses: s.monthlyExpenses + 3000 }) },
        { title: "全力冲刺事业", description: "延后所有个人生活，只为职场最后一跃。", impact: s => ({ ...s, monthlyIncome: s.monthlyIncome + 8000, energy: s.energy - 4 }) },
        { title: "保持现状", description: "拒绝被定义，继续观望。", impact: s => ({ ...s, energy: s.energy + 1 }) }
      ]
    },
    [GameNode.NODE_6]: {
      q: "30岁 · 风险来临",
      sub: "行业波动，你感受到不安全感。现在的选择，代价更高了。",
      next: GameNode.NODE_7,
      jump: 1,
      options: [
        { title: "防守人生", description: "大幅收缩开支，保住现金流储备。", impact: s => ({ ...s, monthlyExpenses: s.monthlyExpenses * 0.8, energy: s.energy - 1, riskValue: s.riskValue - 10 }) },
        { title: "再赌一次", description: "利用已有积累抄底资产，博取跃迁机会。", impact: s => ({ ...s, cash: s.cash * 0.5, passiveIncome: s.passiveIncome + 5000, riskValue: s.riskValue + 40 }) },
        { title: "主动收缩", description: "不再对抗，降低欲望，换取安全感。", impact: s => ({ ...s, monthlyIncome: s.monthlyIncome * 0.9 }) }
      ]
    },
    [GameNode.NODE_7]: {
      q: "31岁 · 精力明显下降",
      sub: "你不再像以前那样能熬夜、拼命。时间和精力开始变得稀缺。",
      next: GameNode.NODE_8,
      jump: 2,
      options: [
        { title: "用钱换时间", description: "购买服务、优化住处，只为腾出精力。", impact: s => ({ ...s, monthlyExpenses: s.monthlyExpenses + 2500, energy: s.energy + 2 }) },
        { title: "用时间换可能性", description: "继续高投入，搏未来，透支健康换财富。", impact: s => ({ ...s, monthlyIncome: s.monthlyIncome + 6000, energy: s.energy - 5 }) },
        { title: "接受现实节奏", description: "放慢节奏关注养生，降低期待适应生活。", impact: s => ({ ...s, energyMax: s.energyMax + 1, monthlyIncome: s.monthlyIncome * 0.8 }) }
      ]
    },
    [GameNode.NODE_8]: {
      q: "33岁 · 中年拐点",
      sub: "人生开始“定型”，大多数人已经很难再改变轨迹。",
      next: GameNode.NODE_9,
      jump: 1,
      options: [
        { title: "稳住现有成果", description: "不再折腾，守住已拥有的，风险降到最低。", impact: s => ({ ...s, riskValue: 0 }) },
        { title: "二次跃迁", description: "做一次高风险但可能改变人生的选择。", impact: s => ({ ...s, cash: s.cash * 0.3, monthlyIncome: s.monthlyIncome * 1.5, riskValue: s.riskValue + 30 }) },
        { title: "转向生活价值", description: "不再以财富作为唯一目标，寻找精神寄托。", impact: s => ({ ...s, energyMax: s.energyMax + 2, passiveIncome: s.passiveIncome * 1.1 }) }
      ]
    },
    [GameNode.NODE_9]: {
      q: "34岁 · 回头看",
      sub: "你开始频繁回忆过去的选择，也更清楚什么适合自己。",
      next: GameNode.NODE_10,
      jump: 1,
      options: [
        { title: "接受所有结果", description: "不再假设如果，与过去的所有选择和解。", impact: s => s },
        { title: "微调方向", description: "在不推翻一切的前提下局部修缮生活。", impact: s => ({ ...s, energy: s.energy - 1, monthlyExpenses: s.monthlyExpenses + 500 }) },
        { title: "推倒重来", description: "哪怕代价很大，也要换赛道重新开始。", impact: s => ({ ...s, cash: s.cash * 0.6, monthlyIncome: 8000, energyMax: 12 }) }
      ]
    },
    [GameNode.NODE_10]: {
      q: "35岁 · 人生状态确认",
      sub: "人生进入一个阶段性终点。你如何评价现在的自己？",
      next: GameNode.GAME_OVER,
      jump: 0,
      options: [
        { title: "稳定但受限", description: "安全、可预期，但空间已锁死。", impact: s => s },
        { title: "紧绷但有希望", description: "压力巨大，但未来还有博弈空间。", impact: s => s },
        { title: "自由但不确定", description: "掌控了时间，但也得承担所有后果。", impact: s => s }
      ]
    }
  };

  // --- 视图渲染 ---

  const renderIntro = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-8 animate-in fade-in zoom-in duration-1000">
      <div className="w-24 h-24 mb-10 gold-gradient rounded-[2.5rem] flex items-center justify-center shadow-2xl relative">
        <Rocket size={44} className="text-white" />
        <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] animate-ping opacity-20"></div>
      </div>
      <h1 className="text-4xl font-black mb-6 tracking-tighter text-white">40年关键决策</h1>
      <p className="text-slate-400 text-sm leading-relaxed mb-12 max-w-[280px]">
        人生不是由每一个小时构成的，<br/>
        而是由几个关键的决策决定的。<br/>
        <span className="text-amber-500 mt-2 block font-bold">35岁前，你会把自己走成哪样？</span>
      </p>
      <button 
        onClick={() => setGameState(GameNode.NODE_1)}
        className="w-full py-5 rounded-3xl gold-gradient font-black text-lg shadow-2xl active:scale-95 transition-all"
      >
        开启模拟
      </button>
    </div>
  );

  const renderDecision = (nodeId: number) => {
    const node = nodes[nodeId];
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="px-2">
          <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-black mb-3 uppercase tracking-widest">
            {node.q.split(' · ')[0]}
          </div>
          <h2 className="text-2xl font-black text-white mb-2 leading-tight">{node.q.split(' · ')[1]}</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{node.sub}</p>
        </div>
        <div className="grid gap-3">
          {node.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleDecision(opt, node.next, node.jump)}
              className="glass-panel p-5 rounded-[2rem] text-left active:scale-[0.97] transition-all border border-white/5 hover:border-amber-500/30 group"
            >
              <div className="font-bold text-white group-hover:text-amber-400 transition-colors mb-1">{opt.title}</div>
              <p className="text-[11px] text-slate-500 leading-normal">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderGameOver = () => {
    const isFree = passiveRatio >= 100;
    const profile = lifeProfile;

    return (
      <div className="text-center py-4 animate-in zoom-in duration-700 space-y-6">
        <div className="w-16 h-16 gold-gradient rounded-full mx-auto flex items-center justify-center shadow-2xl">
          <Award size={32} className="text-white" />
        </div>
        
        <div>
          <h2 className="text-2xl font-black text-white">{profile.title}</h2>
          <div className="flex gap-2 justify-center mt-2">
            {profile.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-white/5 rounded-full text-[9px] text-slate-400 font-bold uppercase tracking-wider">#{tag}</span>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[2.5rem] text-left relative overflow-hidden">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-black mb-3">
            <BrainCircuit size={14} /> 人生状态画像
          </div>
          <p className="text-sm text-slate-300 leading-relaxed italic">
            “{profile.desc}”
          </p>
          <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
            <div className="text-[10px] text-slate-500 font-black uppercase">最终财富积蓄</div>
            <div className="text-amber-500 font-black text-lg">¥{formatMoney(stats.cash)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel p-4 rounded-[2rem] text-left">
            <div className="text-[9px] text-slate-500 font-black uppercase mb-1">风险系数</div>
            <div className="text-sm font-black text-red-400">{stats.riskValue > 60 ? '高危' : stats.riskValue > 30 ? '中等' : '稳健'}</div>
          </div>
          <div className="glass-panel p-4 rounded-[2rem] text-left">
            <div className="text-[9px] text-slate-500 font-black uppercase mb-1">自由进度</div>
            <div className="text-sm font-black text-emerald-400">{passiveRatio}%</div>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl flex gap-3 items-start text-left">
          <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 leading-normal">
            这是你这一局人生的状态，不是评价。每一段人生都有其独特的代价与奖赏。
          </p>
        </div>

        <button 
          onClick={resetGame} 
          className="w-full py-5 gold-gradient rounded-[2rem] font-black shadow-2xl active:scale-95 transition-all"
        >
          再来一局（带着现在的认知）
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen max-w-md mx-auto relative flex flex-col p-4 overflow-hidden bg-[#020617] text-slate-50">
      {/* 全屏跳转遮罩 */}
      {isTimeJumping && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] px-8">
           <div className="absolute inset-0 pointer-events-none opacity-40">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute inset-0 border border-amber-500/10 rounded-full tunnel-effect" style={{ animationDelay: `${i * 0.2}s` }}></div>
            ))}
          </div>
          
          <div className="relative z-10 text-center mb-12">
            <div className="inline-block p-4 bg-amber-500/5 rounded-full mb-4">
              <Clock className="text-amber-500" size={44} />
            </div>
            <h3 className="text-5xl font-black text-white mb-2">{jumpTargetAge}<span className="text-xl ml-1 text-slate-600">岁</span></h3>
            <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.5em]">时光压缩中...</p>
          </div>

          <div className="w-full space-y-4">
            <div className="glass-panel p-6 rounded-[2.5rem] bg-white/5">
              <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black mb-4 uppercase">
                <ReceiptText size={14} className="text-blue-500" /> 期间收支简报
              </div>
              {jumpReport && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">日常磨损 ({jumpReport.reason})</span>
                    <span className="text-red-400 font-bold">- ¥{formatMoney(jumpReport.lost)}</span>
                  </div>
                  <div className="h-[1px] bg-white/5"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-200 text-xs font-black">实际积蓄增长</span>
                    <span className="text-emerald-400 font-black">+ ¥{formatMoney(jumpReport.actualGained)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 顶部简易状态栏 */}
      {gameState > GameNode.INTRO && gameState < GameNode.GAME_OVER && (
        <header className="sticky top-0 z-40 safe-pt -mx-4 px-6 pb-4 mb-4 bg-[#020617]/90 backdrop-blur-xl flex justify-between items-end border-b border-white/5">
          <div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-tighter mb-1">可用现金</div>
            <div className={`text-2xl font-black transition-all duration-300 ${cashPop ? 'scale-105 text-amber-400' : 'text-white'}`}>
              <span className="text-amber-500 text-lg mr-1 font-bold">¥</span>{formatMoney(stats.cash)}
            </div>
          </div>
          <div className="text-right">
             <div className="flex items-center justify-end gap-1 mb-1 text-[10px] text-slate-500 font-black uppercase">
                <Zap size={10} className="text-blue-400 fill-blue-400" /> {stats.energy}/{stats.energyMax}
              </div>
              <div className="flex gap-0.5 justify-end">
                {[...Array(stats.energyMax)].map((_, i) => (
                  <div key={i} className={`h-1.5 w-2.5 rounded-full ${i < stats.energy ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-slate-800'}`} />
                ))}
              </div>
          </div>
        </header>
      )}

      {/* 游戏主体 */}
      <main className="flex-1 pb-32">
        {gameState === GameNode.INTRO && renderIntro()}
        {gameState >= GameNode.NODE_1 && gameState <= GameNode.NODE_10 && renderDecision(gameState)}
        {gameState === GameNode.GAME_OVER && renderGameOver()}
      </main>

      {/* 底部迷你仪表盘 */}
      {gameState > GameNode.INTRO && gameState < GameNode.GAME_OVER && (
        <div className="fixed bottom-0 left-0 right-0 p-4 safe-pb z-40 pointer-events-none">
          <div className="glass-panel p-5 rounded-[2.5rem] shadow-2xl flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-2xl">
                <TrendingUp size={18} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-[9px] text-slate-500 font-black uppercase">月均结余</div>
                <div className="text-sm font-black text-emerald-400">+¥{formatMoney(stats.monthlyIncome + stats.passiveIncome - stats.monthlyExpenses)}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-[9px] text-slate-500 font-black uppercase mb-1">自由进度</div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, passiveRatio)}%` }} />
                </div>
                <span className="text-[10px] font-black text-amber-500">{passiveRatio}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

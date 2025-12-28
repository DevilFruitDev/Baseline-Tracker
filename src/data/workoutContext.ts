// Detailed workout context and instructions for each test

export const WORKOUT_CONTEXT: Record<string, {
  description: string;
  setup: string;
  execution: string;
  tips: string[];
}> = {
  pullups: {
    description: "Strict pull-ups test upper body pulling strength and grip endurance.",
    setup: "Hang from a pull-up bar with arms fully extended, hands shoulder-width apart, palms facing away.",
    execution: "Pull your body up until your chin clears the bar, then lower with control to full arm extension. No kipping or swinging.",
    tips: [
      "Keep core engaged throughout",
      "Full extension at bottom is required",
      "Chin must clear the bar at top",
      "Control the descent - no dropping"
    ]
  },
  pushups: {
    description: "Strict push-ups measure upper body pressing strength and core stability.",
    setup: "Start in plank position, hands slightly wider than shoulders, body in straight line.",
    execution: "Lower chest to ground while keeping elbows close to body, then press back to start. Maintain rigid body throughout.",
    tips: [
      "Chest must touch the ground",
      "Keep hips level - no sagging",
      "Full lockout at top position",
      "Elbows should track at 45° from body"
    ]
  },
  goblet_squat: {
    description: "Goblet squats with tempo test leg strength and control under load.",
    setup: "Hold 40 lb dumbbell/kettlebell at chest height, feet shoulder-width apart.",
    execution: "Descend slowly (3 seconds) to full squat depth, pause briefly, then explode up (1 second). Maintain upright torso.",
    tips: [
      "Count tempo: 3 seconds down, 1 second up",
      "Keep weight at chest height",
      "Knees track over toes",
      "Full depth: hip crease below knee"
    ]
  },
  calf_raise_left: {
    description: "Single-leg calf raises test lower leg strength and balance.",
    setup: "Stand on left foot on edge of step, keep knee straight, other leg bent behind you.",
    execution: "Lower heel below step level, then press up onto toes as high as possible. Control both directions.",
    tips: [
      "Full range of motion is key",
      "Keep knee straight",
      "Control the eccentric (lowering)",
      "Can hold wall for light balance only"
    ]
  },
  calf_raise_right: {
    description: "Single-leg calf raises test lower leg strength and balance.",
    setup: "Stand on right foot on edge of step, keep knee straight, other leg bent behind you.",
    execution: "Lower heel below step level, then press up onto toes as high as possible. Control both directions.",
    tips: [
      "Full range of motion is key",
      "Keep knee straight",
      "Control the eccentric (lowering)",
      "Can hold wall for light balance only"
    ]
  },
  bw_circuit: {
    description: "Bodyweight circuit tests muscular endurance and cardiovascular conditioning.",
    setup: "Complete all reps of each exercise in order: 40 air squats, 30 push-ups, 20 sit-ups, 10 burpees.",
    execution: "Move through the circuit as fast as possible while maintaining good form. Timer starts with first squat, stops after final burpee.",
    tips: [
      "Pace yourself - don't burn out early",
      "Maintain form throughout",
      "Rest minimally between exercises",
      "Full range on all movements"
    ]
  },
  cooper_run: {
    description: "The 12-minute Cooper test measures cardiovascular endurance and aerobic capacity.",
    setup: "Use a measured track or treadmill. Warm up for 5-10 minutes before starting.",
    execution: "Run as far as possible in 12 minutes. Record total distance covered in miles.",
    tips: [
      "Start at sustainable pace",
      "Focus on consistent rhythm",
      "Save energy for final 2 minutes",
      "Track should be flat and measured"
    ]
  },
  plank: {
    description: "Front plank tests core endurance and postural stability.",
    setup: "Forearms on ground, elbows under shoulders, body in straight line from head to heels.",
    execution: "Hold position without sagging hips or raising butt. Maintain neutral spine and engaged core.",
    tips: [
      "Squeeze glutes and quads",
      "Don't hold your breath",
      "Hips level with shoulders",
      "Stop if form breaks significantly"
    ]
  },
  knee_raises: {
    description: "Hanging knee raises test lower abdominal strength and grip endurance.",
    setup: "Hang from pull-up bar with arms extended, legs straight down.",
    execution: "Bring knees to chest using abs (not momentum), then lower with control to start position.",
    tips: [
      "No swinging or kipping",
      "Control the descent",
      "Pull with abs, not hip flexors",
      "Full knee-to-chest contraction"
    ]
  },
  deep_squat: {
    description: "Deep squat hold tests hip and ankle mobility plus lower body endurance.",
    setup: "Feet shoulder-width apart, toes slightly out. Descend to full depth squat.",
    execution: "Hold bottom position with heels down, chest up, and torso upright. Arms can extend forward for balance.",
    tips: [
      "Heels must stay down",
      "Keep torso as upright as possible",
      "Relax into the position",
      "Breathe normally throughout"
    ]
  },
  shoulder_wall: {
    description: "Shoulder flexion test assesses overhead mobility and thoracic extension.",
    setup: "Stand with back against wall, feet 6 inches from wall, ribs down.",
    execution: "Raise arms overhead trying to touch wall with hands while keeping lower back flat and ribs down.",
    tips: [
      "Don't arch lower back",
      "Keep ribs pulled down",
      "Thumbs should touch wall if passing",
      "Maintain head contact with wall"
    ]
  },
  balance_left: {
    description: "Single-leg balance with eyes closed tests proprioception and stability.",
    setup: "Stand on left leg, close eyes, arms at sides or across chest.",
    execution: "Balance for as long as possible. Timer stops when: eyes open, foot touches down, or you hop.",
    tips: [
      "Start with eyes open, then close",
      "Find stable position before closing eyes",
      "Engage core for stability",
      "Practice regularly to improve"
    ]
  },
  balance_right: {
    description: "Single-leg balance with eyes closed tests proprioception and stability.",
    setup: "Stand on right leg, close eyes, arms at sides or across chest.",
    execution: "Balance for as long as possible. Timer stops when: eyes open, foot touches down, or you hop.",
    tips: [
      "Start with eyes open, then close",
      "Find stable position before closing eyes",
      "Engage core for stability",
      "Practice regularly to improve"
    ]
  },
  wall_posture: {
    description: "Wall posture hold tests postural endurance and thoracic extension.",
    setup: "Stand with heels, butt, shoulders, and head touching wall. Maintain natural spinal curves.",
    execution: "Hold position for 60 seconds while keeping all points of contact. Breathe normally.",
    tips: [
      "Don't force lower back flat",
      "Keep chin slightly tucked",
      "Shoulders back and down",
      "Relax neck and jaw"
    ]
  }
};

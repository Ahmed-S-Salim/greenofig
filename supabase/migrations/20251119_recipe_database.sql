-- Recipe Database Tables
-- This migration creates tables for the Recipe Database feature (Premium tier)

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- breakfast, lunch, dinner, snack, dessert
  diet_type TEXT, -- vegetarian, vegan, keto, paleo, gluten-free, dairy-free, balanced
  prep_time_minutes INTEGER NOT NULL,
  cook_time_minutes INTEGER DEFAULT 0,
  servings INTEGER NOT NULL DEFAULT 1,
  calories INTEGER,
  image_url TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of ingredient strings
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of instruction strings
  nutrition_info JSONB DEFAULT '{}'::jsonb, -- {protein, carbs, fat, fiber, sugar, sodium}
  tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- searchable tags
  difficulty TEXT DEFAULT 'medium', -- easy, medium, hard
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorite recipes
CREATE TABLE IF NOT EXISTS user_favorite_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_diet_type ON recipes(diet_type);
CREATE INDEX IF NOT EXISTS idx_recipes_prep_time ON recipes(prep_time_minutes);
CREATE INDEX IF NOT EXISTS idx_recipes_is_active ON recipes(is_active);
CREATE INDEX IF NOT EXISTS idx_user_favorite_recipes_user_id ON user_favorite_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_recipes_recipe_id ON user_favorite_recipes(recipe_id);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipes (all authenticated users can read active recipes)
CREATE POLICY "Anyone can view active recipes"
  ON recipes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can insert recipes"
  ON recipes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Only admins can update recipes"
  ON recipes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Only admins can delete recipes"
  ON recipes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for user_favorite_recipes
CREATE POLICY "Users can view their own favorite recipes"
  ON user_favorite_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite recipes"
  ON user_favorite_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite recipes"
  ON user_favorite_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Insert sample recipes
INSERT INTO recipes (name, description, category, diet_type, prep_time_minutes, cook_time_minutes, servings, calories, ingredients, instructions, nutrition_info, tags, difficulty) VALUES
  (
    'Protein Overnight Oats',
    'High-protein breakfast that you can prepare the night before',
    'breakfast',
    'vegetarian',
    5,
    0,
    1,
    350,
    '["1/2 cup rolled oats", "1 scoop vanilla protein powder", "1 cup almond milk", "1 tbsp chia seeds", "1/2 banana sliced", "1 tbsp almond butter", "1 tsp honey"]'::jsonb,
    '["Combine oats, protein powder, almond milk, and chia seeds in a jar", "Stir well to combine", "Refrigerate overnight (at least 4 hours)", "In the morning, top with banana slices, almond butter, and honey", "Enjoy cold or heat for 30 seconds in microwave"]'::jsonb,
    '{"protein": 30, "carbs": 45, "fat": 12, "fiber": 8, "sugar": 15, "sodium": 200}'::jsonb,
    ARRAY['high-protein', 'make-ahead', 'breakfast', 'healthy'],
    'easy'
  ),
  (
    'Mediterranean Quinoa Bowl',
    'Nutritious and filling lunch bowl packed with vegetables',
    'lunch',
    'vegan',
    15,
    20,
    2,
    420,
    '["1 cup quinoa", "2 cups vegetable broth", "1 cucumber diced", "1 cup cherry tomatoes halved", "1/2 red onion diced", "1/4 cup kalamata olives", "1/4 cup fresh parsley", "2 tbsp olive oil", "2 tbsp lemon juice", "1 tsp dried oregano", "Salt and pepper to taste"]'::jsonb,
    '["Cook quinoa in vegetable broth according to package directions", "Let quinoa cool to room temperature", "In a large bowl, combine cucumber, tomatoes, onion, olives, and parsley", "Add cooled quinoa to the bowl", "In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper", "Pour dressing over quinoa mixture and toss to combine", "Serve immediately or refrigerate for up to 3 days"]'::jsonb,
    '{"protein": 12, "carbs": 58, "fat": 15, "fiber": 10, "sugar": 6, "sodium": 350}'::jsonb,
    ARRAY['vegan', 'mediterranean', 'meal-prep', 'lunch'],
    'easy'
  ),
  (
    'Grilled Lemon Herb Chicken',
    'Juicy grilled chicken breast with fresh herbs',
    'dinner',
    'keto',
    10,
    15,
    4,
    280,
    '["4 chicken breasts", "3 tbsp olive oil", "2 tbsp lemon juice", "2 cloves garlic minced", "1 tbsp fresh rosemary", "1 tbsp fresh thyme", "1 tsp paprika", "Salt and pepper to taste"]'::jsonb,
    '["In a bowl, combine olive oil, lemon juice, garlic, rosemary, thyme, paprika, salt, and pepper", "Add chicken breasts and coat evenly with marinade", "Marinate for at least 30 minutes (or up to 4 hours)", "Preheat grill to medium-high heat", "Grill chicken for 6-7 minutes per side until internal temperature reaches 165°F", "Let rest for 5 minutes before serving", "Serve with roasted vegetables or salad"]'::jsonb,
    '{"protein": 42, "carbs": 2, "fat": 14, "fiber": 0, "sugar": 1, "sodium": 280}'::jsonb,
    ARRAY['keto', 'high-protein', 'dinner', 'grilled'],
    'medium'
  ),
  (
    'Avocado Chocolate Mousse',
    'Healthy and creamy chocolate mousse made with avocado',
    'dessert',
    'vegan',
    10,
    0,
    4,
    180,
    '["2 ripe avocados", "1/4 cup cocoa powder", "1/4 cup maple syrup", "1/4 cup almond milk", "1 tsp vanilla extract", "Pinch of sea salt", "Fresh berries for topping"]'::jsonb,
    '["Add all ingredients except berries to a food processor", "Blend until completely smooth and creamy", "Taste and adjust sweetness if needed", "Divide into serving bowls", "Refrigerate for at least 30 minutes", "Top with fresh berries before serving"]'::jsonb,
    '{"protein": 3, "carbs": 22, "fat": 11, "fiber": 7, "sugar": 12, "sodium": 45}'::jsonb,
    ARRAY['vegan', 'dessert', 'healthy', 'no-bake'],
    'easy'
  ),
  (
    'Sweet Potato Buddha Bowl',
    'Colorful and nutrient-dense bowl with roasted sweet potato',
    'dinner',
    'vegan',
    15,
    30,
    2,
    480,
    '["2 medium sweet potatoes cubed", "1 can chickpeas drained", "2 cups kale chopped", "1/2 cup quinoa", "2 tbsp tahini", "1 tbsp lemon juice", "1 tbsp olive oil", "1 tsp cumin", "1 tsp paprika", "Salt and pepper to taste"]'::jsonb,
    '["Preheat oven to 400°F", "Toss sweet potato cubes and chickpeas with olive oil, cumin, paprika, salt, and pepper", "Roast for 25-30 minutes until crispy", "Cook quinoa according to package directions", "Massage kale with a bit of olive oil until softened", "Make tahini dressing by mixing tahini, lemon juice, and water until smooth", "Assemble bowls with quinoa, kale, roasted sweet potato, and chickpeas", "Drizzle with tahini dressing"]'::jsonb,
    '{"protein": 18, "carbs": 72, "fat": 14, "fiber": 16, "sugar": 12, "sodium": 320}'::jsonb,
    ARRAY['vegan', 'buddha-bowl', 'dinner', 'meal-prep'],
    'medium'
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_recipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_recipes_updated_at_trigger
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_recipes_updated_at();

-- InternTrack Schema

-- 1. Users Table (Core Profiles)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT CHECK (role IN ('intern', 'manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Managers Table
CREATE TABLE public.managers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    is_manager_of_the_day BOOLEAN DEFAULT FALSE
);

-- 3. Interns Table
CREATE TABLE public.interns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    manager_id UUID REFERENCES public.managers(id) ON DELETE SET NULL
);


-- 4. Tasks Table
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    intern_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Learnings Table
CREATE TABLE public.learnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    intern_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    learning_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Activity Log (Feed)
CREATE TABLE public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL, -- 'task_started', 'task_completed', 'learning_added'
    description TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "Users can view all user profiles" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert their own record" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own record" ON public.users FOR UPDATE USING (auth.uid() = id);


-- ROLES
CREATE POLICY "Anyone authenticated can view managers" ON public.managers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone authenticated can view interns" ON public.interns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert themselves as manager" ON public.managers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert themselves as intern" ON public.interns FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TASKS
CREATE POLICY "Interns can manage their own tasks" ON public.tasks FOR ALL USING (auth.uid() = intern_id);
CREATE POLICY "Managers can view tasks of interns they manage" ON public.tasks FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.interns i 
        WHERE i.user_id = public.tasks.intern_id 
        AND i.manager_id IN (SELECT id FROM public.managers WHERE user_id = auth.uid())
    )
);

-- ACTIVITIES
CREATE POLICY "Users can view their own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Managers can view activities of their interns" ON public.activities FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.interns i 
        WHERE i.user_id = public.activities.user_id 
        AND i.manager_id IN (SELECT id FROM public.managers WHERE user_id = auth.uid())
    )
);

-- LEARNINGS
CREATE POLICY "Interns can manage their learnings" ON public.learnings FOR ALL USING (auth.uid() = intern_id);
CREATE POLICY "Managers can view learnings of their interns" ON public.learnings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.interns i 
        WHERE i.user_id = public.learnings.intern_id 
        AND i.manager_id IN (SELECT id FROM public.managers WHERE user_id = auth.uid())
    )
);


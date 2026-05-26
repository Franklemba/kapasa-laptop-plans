


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."handle_new_client"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ BEGIN IF NEW.user_id IS NULL THEN NEW.user_id := auth.uid(); END IF; RETURN NEW; END; $$;


ALTER FUNCTION "public"."handle_new_client"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_laptop_stock"("p_laptop_id" "uuid", "p_movement_type" "text", "p_quantity" integer, "p_reason" "text" DEFAULT NULL::"text", "p_reference_number" "text" DEFAULT NULL::"text", "p_notes" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  current_stock INTEGER;
  new_stock INTEGER;
BEGIN
  -- Get current stock
  SELECT stock_quantity INTO current_stock
  FROM public.laptops
  WHERE id = p_laptop_id;
  
  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Laptop not found';
  END IF;
  
  -- Calculate new stock based on movement type
  CASE p_movement_type
    WHEN 'stock_in', 'returned' THEN
      new_stock := current_stock + p_quantity;
    WHEN 'stock_out', 'sold', 'damaged' THEN
      new_stock := current_stock - p_quantity;
    WHEN 'adjustment' THEN
      new_stock := p_quantity; -- Direct adjustment to specific quantity
    ELSE
      RAISE EXCEPTION 'Invalid movement type';
  END CASE;
  
  -- Ensure stock doesn't go negative
  IF new_stock < 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Current: %, Requested: %', current_stock, p_quantity;
  END IF;
  
  -- Update laptop stock
  UPDATE public.laptops
  SET stock_quantity = new_stock,
      updated_at = now(),
      updated_by = auth.uid()
  WHERE id = p_laptop_id;
  
  -- Record stock movement
  INSERT INTO public.stock_movements (
    laptop_id,
    movement_type,
    quantity,
    previous_quantity,
    new_quantity,
    reason,
    reference_number,
    notes,
    created_by
  ) VALUES (
    p_laptop_id,
    p_movement_type,
    p_quantity,
    current_stock,
    new_stock,
    p_reason,
    p_reference_number,
    p_notes,
    auth.uid()
  );
END;
$$;


ALTER FUNCTION "public"."update_laptop_stock"("p_laptop_id" "uuid", "p_movement_type" "text", "p_quantity" integer, "p_reason" "text", "p_reference_number" "text", "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "address" "text",
    "national_id" "text",
    "employment_status" "text",
    "monthly_income" numeric,
    "credit_score" integer,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "role" "text" DEFAULT 'client'::"text" NOT NULL,
    CONSTRAINT "clients_role_check" CHECK (("role" = ANY (ARRAY['client'::"text", 'admin'::"text"]))),
    CONSTRAINT "clients_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'suspended'::"text"])))
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."laptop_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "laptop_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "alt_text" character varying(255),
    "is_primary" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."laptop_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."laptops" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "brand" character varying(100) NOT NULL,
    "model" character varying(100) NOT NULL,
    "processor" character varying(255) NOT NULL,
    "ram" character varying(50) NOT NULL,
    "storage" character varying(50) NOT NULL,
    "display" character varying(100) NOT NULL,
    "graphics" character varying(255),
    "price" numeric(10,2) NOT NULL,
    "original_price" numeric(10,2),
    "weekly_payment" numeric(8,2) NOT NULL,
    "condition" character varying(20) DEFAULT 'new'::character varying NOT NULL,
    "stock_quantity" integer DEFAULT 0 NOT NULL,
    "min_stock_level" integer DEFAULT 5 NOT NULL,
    "sku" character varying(100),
    "description" "text",
    "specifications" "jsonb",
    "image_url" "text",
    "status" character varying(20) DEFAULT 'active'::character varying NOT NULL,
    "rating" numeric(3,2) DEFAULT 4.5,
    "review_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "laptops_condition_check" CHECK ((("condition")::"text" = ANY (ARRAY[('new'::character varying)::"text", ('refurbished'::character varying)::"text", ('used'::character varying)::"text"]))),
    CONSTRAINT "laptops_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('active'::character varying)::"text", ('inactive'::character varying)::"text", ('discontinued'::character varying)::"text"])))
);


ALTER TABLE "public"."laptops" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "laptop_id" "uuid" NOT NULL,
    "plan_duration" integer NOT NULL,
    "weekly_payment" numeric NOT NULL,
    "total_amount" numeric NOT NULL,
    "amount_paid" numeric DEFAULT 0 NOT NULL,
    "start_date" "date" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notes" "text",
    CONSTRAINT "payment_plans_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'completed'::"text", 'defaulted'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."payment_plans" OWNER TO "postgres";


COMMENT ON COLUMN "public"."payment_plans"."notes" IS 'Admin notes about the payment plan (e.g., rejection reason, special conditions)';



CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payment_plan_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "payment_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "payment_method" "text" DEFAULT 'cash'::"text",
    "reference_number" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stock_movements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "laptop_id" "uuid" NOT NULL,
    "movement_type" character varying(20) NOT NULL,
    "quantity" integer NOT NULL,
    "previous_quantity" integer NOT NULL,
    "new_quantity" integer NOT NULL,
    "reason" "text",
    "reference_number" character varying(100),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    CONSTRAINT "stock_movements_movement_type_check" CHECK ((("movement_type")::"text" = ANY (ARRAY[('stock_in'::character varying)::"text", ('stock_out'::character varying)::"text", ('adjustment'::character varying)::"text", ('sold'::character varying)::"text", ('damaged'::character varying)::"text", ('returned'::character varying)::"text"])))
);


ALTER TABLE "public"."stock_movements" OWNER TO "postgres";


ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."laptop_images"
    ADD CONSTRAINT "laptop_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."laptops"
    ADD CONSTRAINT "laptops_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."laptops"
    ADD CONSTRAINT "laptops_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."payment_plans"
    ADD CONSTRAINT "payment_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_clients_email" ON "public"."clients" USING "btree" ("email");



CREATE INDEX "idx_clients_status" ON "public"."clients" USING "btree" ("status");



CREATE INDEX "idx_laptop_images_laptop_id" ON "public"."laptop_images" USING "btree" ("laptop_id");



CREATE INDEX "idx_laptops_brand" ON "public"."laptops" USING "btree" ("brand");



CREATE INDEX "idx_laptops_price" ON "public"."laptops" USING "btree" ("price");



CREATE INDEX "idx_laptops_status" ON "public"."laptops" USING "btree" ("status");



CREATE INDEX "idx_laptops_stock_quantity" ON "public"."laptops" USING "btree" ("stock_quantity");



CREATE INDEX "idx_payment_plans_client_id" ON "public"."payment_plans" USING "btree" ("client_id");



CREATE INDEX "idx_payment_plans_status" ON "public"."payment_plans" USING "btree" ("status");



CREATE INDEX "idx_payments_date" ON "public"."payments" USING "btree" ("payment_date");



CREATE INDEX "idx_payments_plan_id" ON "public"."payments" USING "btree" ("payment_plan_id");



CREATE INDEX "idx_stock_movements_created_at" ON "public"."stock_movements" USING "btree" ("created_at");



CREATE INDEX "idx_stock_movements_laptop_id" ON "public"."stock_movements" USING "btree" ("laptop_id");



CREATE OR REPLACE TRIGGER "set_user_id_before_insert" BEFORE INSERT ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_client"();



CREATE OR REPLACE TRIGGER "update_clients_updated_at" BEFORE UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_laptops_updated_at" BEFORE UPDATE ON "public"."laptops" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_payment_plans_updated_at" BEFORE UPDATE ON "public"."payment_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."laptop_images"
    ADD CONSTRAINT "laptop_images_laptop_id_fkey" FOREIGN KEY ("laptop_id") REFERENCES "public"."laptops"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."laptops"
    ADD CONSTRAINT "laptops_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."laptops"
    ADD CONSTRAINT "laptops_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."payment_plans"
    ADD CONSTRAINT "payment_plans_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_plans"
    ADD CONSTRAINT "payment_plans_laptop_id_fkey" FOREIGN KEY ("laptop_id") REFERENCES "public"."laptops"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "public"."payment_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_laptop_id_fkey" FOREIGN KEY ("laptop_id") REFERENCES "public"."laptops"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can create stock movements" ON "public"."stock_movements" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."clients"
  WHERE (("clients"."user_id" = "auth"."uid"()) AND ("clients"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage all payment plans" ON "public"."payment_plans" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."clients"
  WHERE (("clients"."user_id" = "auth"."uid"()) AND ("clients"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage all payments" ON "public"."payments" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."clients"
  WHERE (("clients"."user_id" = "auth"."uid"()) AND ("clients"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage laptop images" ON "public"."laptop_images" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."email")::"text" = 'admin@kapasa.com'::"text")))));



CREATE POLICY "Admins can manage laptops" ON "public"."laptops" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."clients"
  WHERE (("clients"."user_id" = "auth"."uid"()) AND ("clients"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage stock movements" ON "public"."stock_movements" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."clients"
  WHERE (("clients"."user_id" = "auth"."uid"()) AND ("clients"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all payment plans" ON "public"."payment_plans" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."clients"
  WHERE (("clients"."user_id" = "auth"."uid"()) AND ("clients"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view stock movements" ON "public"."stock_movements" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."clients"
  WHERE (("clients"."user_id" = "auth"."uid"()) AND ("clients"."role" = 'admin'::"text")))));



CREATE POLICY "Allow insert for all" ON "public"."clients" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can view laptop images" ON "public"."laptop_images" FOR SELECT USING (true);



CREATE POLICY "Anyone can view laptops" ON "public"."laptops" FOR SELECT USING (true);



CREATE POLICY "Enable delete for users based on user_id" ON "public"."clients" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."clients" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable read access for all users" ON "public"."clients" FOR SELECT USING (true);



CREATE POLICY "Enable update for users based on email" ON "public"."clients" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own payment plans" ON "public"."payment_plans" FOR INSERT TO "authenticated" WITH CHECK (("client_id" IN ( SELECT "clients"."id"
   FROM "public"."clients"
  WHERE ("clients"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update their own payment plans" ON "public"."payment_plans" FOR UPDATE TO "authenticated" USING (("client_id" IN ( SELECT "clients"."id"
   FROM "public"."clients"
  WHERE ("clients"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own payment plans" ON "public"."payment_plans" FOR SELECT TO "authenticated" USING (("client_id" IN ( SELECT "clients"."id"
   FROM "public"."clients"
  WHERE ("clients"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own payments" ON "public"."payments" FOR SELECT TO "authenticated" USING (("payment_plan_id" IN ( SELECT "pp"."id"
   FROM ("public"."payment_plans" "pp"
     JOIN "public"."clients" "c" ON (("pp"."client_id" = "c"."id")))
  WHERE ("c"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."laptop_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."laptops" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stock_movements" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_client"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_client"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_client"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_laptop_stock"("p_laptop_id" "uuid", "p_movement_type" "text", "p_quantity" integer, "p_reason" "text", "p_reference_number" "text", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_laptop_stock"("p_laptop_id" "uuid", "p_movement_type" "text", "p_quantity" integer, "p_reason" "text", "p_reference_number" "text", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_laptop_stock"("p_laptop_id" "uuid", "p_movement_type" "text", "p_quantity" integer, "p_reason" "text", "p_reference_number" "text", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."clients" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."clients" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."clients" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."laptop_images" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."laptop_images" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."laptop_images" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."laptops" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."laptops" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."laptops" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."payment_plans" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."payment_plans" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."payment_plans" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."payments" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."payments" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."payments" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."stock_movements" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."stock_movements" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."stock_movements" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "service_role";








<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateAllProceduresAndFunctions extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS getUsers;
                        CREATE PROCEDURE getUsers()
                        BEGIN
                            SELECT * FROM users;
                        END'
        );
        DB::unprepared('drop FUNCTION IF EXISTS notional_monthly_fees_chargeable_count;
                        CREATE FUNCTION notional_monthly_fees_chargeable_count (input_scr_id bigint) RETURNS int
                        DETERMINISTIC
                        BEGIN
                          DECLARE month_count int;
                          select TIMESTAMPDIFF(MONTH, effective_date, CURDATE())+1 INTO month_count from student_course_registrations where id=input_scr_id and is_completed=0 and is_started=1;
                            RETURN month_count;
                        END'
        );
        DB::unprepared('drop FUNCTION IF EXISTS get_fees_mode_by_scr_id ;
                        CREATE FUNCTION get_fees_mode_by_scr_id (input_scr_id bigint) RETURNS int
                        DETERMINISTIC
                        BEGIN
                        DECLARE mode_id int;
                            select courses.fees_mode_type_id INTO mode_id from student_course_registrations
                             inner join courses ON courses.id = student_course_registrations.course_id
                             where student_course_registrations.id=input_scr_id ;
                            RETURN mode_id;
                        END'

        );
        //this function will return the year of last monthly fees charged for a SCR number
        DB::unprepared('DROP FUNCTION IF EXISTS get_year_of_last_monthly_fees_charged;
                            CREATE FUNCTION get_year_of_last_monthly_fees_charged(input_scr_id bigint) RETURNS int
                            DETERMINISTIC
                            BEGIN
                              DECLARE temp_fees_year int;
                              select fees_year into temp_fees_year  from transaction_masters
                                inner join transaction_details on transaction_details.transaction_master_id = transaction_masters.id
                                where voucher_type_id=9 and student_course_registration_id=input_scr_id and transaction_details.ledger_id=9
                                order by transaction_masters.fees_year desc, transaction_masters.fees_month desc limit 1;
                              IF(temp_fees_year IS NULL) THEN
                                  SET temp_fees_year := 0;
                              END IF;
                                RETURN temp_fees_year;
                            END'

        );
        //this function will return the year of last monthly fees charged for a SCR number
        DB::unprepared('DROP FUNCTION IF EXISTS get_month_of_last_monthly_fees_charged;
                            CREATE FUNCTION get_month_of_last_monthly_fees_charged(input_scr_id bigint) RETURNS int
                            DETERMINISTIC
                            BEGIN
                              DECLARE temp_fees_month int;
                              select fees_month into temp_fees_month  from transaction_masters
                                inner join transaction_details on transaction_details.transaction_master_id = transaction_masters.id
                                where voucher_type_id=9 and student_course_registration_id=input_scr_id and transaction_details.ledger_id=9
                                order by transaction_masters.fees_year desc, transaction_masters.fees_month desc limit 1;
                              IF(temp_fees_month IS NULL) THEN
                                  SET temp_fees_month := 0;
                              END IF;
                                RETURN temp_fees_month;
                            END'

        );
        //this function will return the next year
        DB::unprepared('DROP FUNCTION IF EXISTS get_next_year;
                            CREATE FUNCTION get_next_year (input_year int, input_month int) RETURNS int
                            DETERMINISTIC
                            BEGIN
                                DECLARE temp_year int;
                              select year(date_add(MAKEDATE(input_year, 1),INTERVAL  input_month month)) into temp_year;
                                RETURN temp_year;
                            END'
        );
        //this function will return the next month
        DB::unprepared('DROP FUNCTION IF EXISTS get_next_month;
                            CREATE FUNCTION get_next_month (input_year int, input_month int) RETURNS int
                            DETERMINISTIC
                            BEGIN
                                DECLARE temp_month int;
                              select year(date_add(MAKEDATE(input_year, 1),INTERVAL  input_month month)) into temp_month;
                                RETURN temp_month;
                            END'
        );
        //this function will return total fes charged by scr Id
        DB::unprepared('
        drop FUNCTION IF EXISTS get_total_fees_charged_by_scr_id;
        CREATE FUNCTION get_total_fees_charged_by_scr_id (input_scr_id bigint) RETURNS int
        DETERMINISTIC
        BEGIN
        DECLARE fees_charged int;
          select count(*) INTO fees_charged from transaction_details
          inner join transaction_masters ON transaction_masters.id = transaction_details.transaction_master_id
          where transaction_masters.student_course_registration_id=input_scr_id and transaction_details.ledger_id=9;
          RETURN fees_charged;
        END'

        );
        DB::unprepared('
        drop FUNCTION IF EXISTS get_due_of_one_month;
        CREATE FUNCTION get_due_of_one_month (input_tm_id bigint, input_rtm_id bigint) RETURNS int
        DETERMINISTIC
        BEGIN
          DECLARE month_due int;
          select
          (select amount from transaction_details
          inner join transaction_masters ON transaction_masters.id = transaction_details.transaction_master_id
          where transaction_masters.student_course_registration_id=7
          and ledger_id=16 and transaction_details.transaction_master_id=input_tm_id)-


          (select SUM(amount) from transaction_details
          inner join transaction_masters ON transaction_masters.id = transaction_details.transaction_master_id
          where transaction_masters.reference_transaction_master_id=input_rtm_id and transaction_details.ledger_id=1) INTO month_due;
          RETURN month_due;
        END
        ');
    }

    public function down()
    {
        Schema::dropIfExists('all_procedures_and_functions');
    }
}

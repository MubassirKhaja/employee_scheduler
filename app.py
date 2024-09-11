from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import json
app = Flask(__name__)
CORS(app)
def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="shifts_scheduling_app_db",
        user="postgres",
        password="admin"
    )
    return conn

@app.route('/api/employees', methods=['GET'])
def get_employees():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM employees;')
    employees = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(employees)


@app.route('/api/employees', methods=['POST'])
def create_employee():
    data = request.get_json()
    # print(data)
    name = data['name']
    priority = data['priority']
    max_hours_per_week = data.get('maxHoursPerWeek')


    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO employees (name, priority, max_hours_per_week, restricted_hours) VALUES (%s, %s, %s, %s)',
        (name, priority, max_hours_per_week, max_hours_per_week)
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'status': 'Employee created'}), 201


@app.route('/api/employees/<int:id>/availability', methods=['POST'])
def add_availability(id):
    data = request.get_json()
    day_of_week = data['day_of_week']
    start_time = data['start_time']
    end_time = data['end_time']

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO availability (employee_id, day_of_week, start_time, end_time) VALUES (%s, %s, %s, %s)',
        (id, day_of_week, start_time, end_time)
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'status': 'Availability added'}), 201

@app.route('/api/employees/<int:id>/availability', methods=['GET'])
def get_availability(id):
    from datetime import time
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM availability WHERE employee_id = %s', (id,))
    rows = cur.fetchall()
    # print(availability)
    cur.close()
    conn.close()


    # Convert data to JSON-friendly format
    availability = [
        {
            'id': row[0],
            'employee_id': row[1],
            'day_of_week': row[2],
            'start_time': row[3].strftime('%H:%M') if isinstance(row[3], time) else row[3],
            'end_time': row[4].strftime('%H:%M') if isinstance(row[4], time) else row[4],
        }
        for row in rows
    ]
    return jsonify(availability)
    # return jsonify(availability)
    # return json.dumps(availability)


@app.route('/api/employees/<int:employee_id>/availability/<int:availability_id>', methods=['PUT'])
def update_availability(employee_id, availability_id):
    data = request.get_json()
    day_of_week = data['day_of_week']
    start_time = data['start_time']
    end_time = data['end_time']

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'UPDATE availability SET day_of_week = %s, start_time = %s, end_time = %s WHERE id = %s AND employee_id = %s',
        (day_of_week, start_time, end_time, availability_id, employee_id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'status': 'Availability updated'})


@app.route('/api/employees/<int:employee_id>/availability/<int:availability_id>', methods=['DELETE'])
def delete_availability(employee_id, availability_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM availability WHERE id = %s AND employee_id = %s', (availability_id, employee_id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'status': 'Availability deleted'})

# Update an employee
@app.route('/api/employees/<int:id>', methods=['PUT'])
def update_employee(id):
    data = request.get_json()
    # print(data)
    name = data['name']
    priority = data['priority']
    max_hours_per_week = data.get('maxHoursPerWeek', 44)
    restricted_hours = data.get('restrictedHours')
    # print(restricted_hours)

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'UPDATE employees SET name = %s, priority = %s, max_hours_per_week = %s, restricted_hours = %s WHERE id = %s',
        (name, priority, max_hours_per_week, restricted_hours, id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'status': 'Employee updated'})

# Delete an employee
@app.route('/api/employees/<int:id>', methods=['DELETE'])
def delete_employee(id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM employees WHERE id = %s', (id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'status': 'Employee deleted'})







from datetime import datetime, timedelta
import datetime as dt
@app.route('/api/schedule', methods=['POST'])
def generate_schedule():
    conn = get_db_connection()
    cur = conn.cursor()

    # Get all employees and their availability
    cur.execute('SELECT id, priority, max_hours_per_week FROM employees ORDER BY priority ASC')
    employees = cur.fetchall()

    # Initialize schedule
    schedule = []
    week_start = datetime.now().date() + timedelta(days=(7 - datetime.now().weekday()))  # Start from next Monday

    # Track total hours per employee
    employee_hours = {emp[0]: 0 for emp in employees}

    # Define shift times
    busy_hours_end = datetime.strptime("16:00:00", "%H:%M:%S").time()  # End of busy hours
    max_shift_end = datetime.strptime("23:00:00", "%H:%M:%S").time()  # End of scheduling day

    # Loop through each day and generate the schedule
    for day in range(7):
        daily_schedule = []
        day_total_hours = {emp[0]: 0 for emp in employees}

        # Get busy hours for the specific day
        cur.execute('SELECT start_time, end_time, min_employees FROM busy_hours WHERE day_of_week = %s', (day,))
        busy_hours = cur.fetchall()

        for busy in busy_hours:
            busy_start = busy[0]
            busy_end = busy[1]
            min_employees = busy[2]

            # Find available employees during busy hours
            available_employees = [
                emp for emp in employees
                if any(avail[0] == day and avail[1] <= busy_start and avail[2] >= busy_end
                       for avail in get_availability_for_employee(cur, emp[0]))
            ]

            # Sort employees by priority and select the top N
            available_employees.sort(key=lambda e: e[1])  # Sort by priority
            scheduled_employees = available_employees[:min_employees]

            for emp in scheduled_employees:
                start_time = busy_start
                end_time = busy_end
                shift_hours = (datetime.combine(datetime.now().date(), end_time) - datetime.combine(datetime.now().date(), start_time)).seconds / 3600

                if employee_hours[emp[0]] + shift_hours <= emp[2]:
                    daily_schedule.append({
                        'employee_id': emp[0],
                        'date': (week_start + timedelta(days=day)).isoformat(),
                        'start_time': start_time.isoformat(),
                        'end_time': end_time.isoformat()
                    })
                    employee_hours[emp[0]] += shift_hours

        # Schedule continuous shifts from 4 PM to 11 PM
        start_time = datetime.strptime("16:00:00", "%H:%M:%S").time()
        end_time = max_shift_end
        min_employees = 2 if start_time >= datetime.strptime("21:00:00", "%H:%M:%S").time() else 6

        available_employees = [
            emp for emp in employees
            if any(avail[0] == day and avail[1] <= start_time and avail[2] >= end_time
                   for avail in get_availability_for_employee(cur, emp[0]))
            and employee_hours[emp[0]] + (datetime.combine(datetime.now().date(), end_time) - datetime.combine(datetime.now().date(), start_time)).seconds / 3600 <= emp[2]
        ]

        available_employees.sort(key=lambda e: e[1])  # Sort by priority
        scheduled_employees = available_employees[:min_employees]

        for emp in scheduled_employees:
            shift_hours = (datetime.combine(datetime.now().date(), end_time) - datetime.combine(datetime.now().date(), start_time)).seconds / 3600
            if employee_hours[emp[0]] + shift_hours <= emp[2]:
                daily_schedule.append({
                    'employee_id': emp[0],
                    'date': (week_start + timedelta(days=day)).isoformat(),
                    'start_time': start_time.isoformat(),
                    'end_time': end_time.isoformat()
                })
                employee_hours[emp[0]] += shift_hours

        schedule.extend(daily_schedule)

    # Insert the schedule into the database
    for shift in schedule:
        cur.execute(
            'INSERT INTO schedules (employee_id, date, start_time, end_time) VALUES (%s, %s, %s, %s)',
            (shift['employee_id'], shift['date'], shift['start_time'], shift['end_time'])
        )

    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'status': 'Schedule generated', 'schedule': schedule}), 201


@app.route('/api/employees/<int:employee_id>/timeoff', methods=['POST'])
def request_time_off(employee_id):
    data = request.get_json()
    date = data['date']  # Format: 'YYYY-MM-DD'

    conn = get_db_connection()
    cur = conn.cursor()

    # Delete the employee's schedule for the requested day
    cur.execute('DELETE FROM schedules WHERE employee_id = %s AND date = %s', (employee_id, date))

    # Find a replacement
    cur.execute('SELECT id, priority, max_hours_per_week FROM employees WHERE id != %s ORDER BY priority ASC', (employee_id,))
    replacement_candidates = cur.fetchall()

    cur.execute('SELECT start_time, end_time FROM availability WHERE employee_id = %s AND day_of_week = extract(dow from date %s)', (employee_id, date))
    requested_off_shifts = cur.fetchall()

    for shift in requested_off_shifts:
        for candidate in replacement_candidates:
            candidate_id, priority, max_hours = candidate
            cur.execute('SELECT sum(EXTRACT(epoch from (end_time - start_time))/3600) FROM schedules WHERE employee_id = %s AND date BETWEEN %s AND %s', (candidate_id, date, date))
            worked_hours = cur.fetchone()[0] or 0

            if worked_hours + (datetime.combine(datetime.now(), shift[1]) - datetime.combine(datetime.now(), shift[0])).seconds / 3600 <= max_hours:
                cur.execute('INSERT INTO schedules (employee_id, date, start_time, end_time) VALUES (%s, %s, %s, %s)',
                            (candidate_id, date, shift[0], shift[1]))
                break

    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'status': 'Time off granted and schedule updated'}), 200

def get_availability_for_employee(cur, employee_id):
    cur.execute('SELECT day_of_week, start_time, end_time FROM availability WHERE employee_id = %s', (employee_id,))
    return cur.fetchall()







########roles api endpoints

@app.route('/api/roles', methods=['POST'])
def add_role():
    data = request.json
    role_name = data.get('role_name')
    print(role_name)
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO roles (role_name) VALUES (%s) RETURNING id',
        (role_name,)
    )
    role_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'status': 'Role added', 'id': role_id}), 201

@app.route('/api/roles', methods=['GET'])
def get_roles():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, role_name FROM roles ORDER BY role_name')
    response = cur.fetchall()
    # print(roles)
    cur.close()
    conn.close()
        # Convert data to JSON-friendly format
    roles = [
        {
            'id': row[0],
            'role_name': row[1]
        }
        for row in response
    ]

    return jsonify(roles), 200

@app.route('/api/roles/<int:id>', methods=['PUT'])
def update_role(id):
    data = request.json
    role_name = data.get('role_name')
    print(data)
    # Check if role_name is provided
    if not role_name:
        return jsonify({'error': 'Role name is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if the role exists
    cur.execute('SELECT id FROM roles WHERE id = %s', (id,))
    role = cur.fetchone()
    if not role:
        cur.close()
        conn.close()
        return jsonify({'error': 'Role not found'}), 404

    # Update the role
    cur.execute(
        'UPDATE roles SET role_name = %s WHERE id = %s',
        (role_name, id)
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'status': 'Role updated'}), 200


@app.route('/api/roles/<int:id>', methods=['DELETE'])
def delete_role(id):
    conn = get_db_connection()
    cur = conn.cursor()

    # Check if the role exists
    cur.execute('SELECT id FROM roles WHERE id = %s', (id,))
    role = cur.fetchone()
    if not role:
        cur.close()
        conn.close()
        return jsonify({'error': 'Role not found'}), 404

    # Check if the role is assigned to any employee
    cur.execute('SELECT 1 FROM employee_roles WHERE role_id = %s LIMIT 1', (id,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({'error': 'Role is assigned to an employee and cannot be deleted'}), 400

    # Delete the role if it's not assigned to any employee
    cur.execute('DELETE FROM roles WHERE id = %s', (id,))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'status': 'Role deleted successfully'}), 200

@app.route('/api/employees/<int:employee_id>/roles', methods=['POST'])
def assign_roles(employee_id):
    data = request.json
    # print(data)
    role_ids = data.get('role_ids', [])
    # print(role_ids)
    conn = get_db_connection()
    cur = conn.cursor()

    # First, delete existing roles for the employee
    cur.execute('DELETE FROM employee_roles WHERE employee_id = %s', (employee_id,))

    # Now, insert the new roles
    for role_id in role_ids:
        cur.execute(
            'INSERT INTO employee_roles (employee_id, role_id) VALUES (%s, %s)',
            (employee_id, role_id)
        )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({'status': 'Roles assigned'}), 200

@app.route('/api/employees/<int:employee_id>/roles', methods=['GET'])
def emp_assigned_roles(employee_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * from employee_roles WHERE employee_id = %s', (employee_id,))
    res = cur.fetchall()
    print(res)
    conn.commit()
    cur.close()
    conn.close()
    roles = [{
        'id': role_id[1],

    } for role_id in res]
    
    return jsonify(roles), 200

@app.route('/api/employees-with-roles', methods=['GET'])
def get_employees_with_roles():
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        SELECT e.id, e.name, e.priority, e.max_hours_per_week, e.restricted_hours, 
               COALESCE(array_agg(r.role_name ORDER BY r.role_name), '{}')
        FROM employees e
        LEFT JOIN employee_roles er ON e.id = er.employee_id
        LEFT JOIN roles r ON er.role_id = r.id
        GROUP BY e.id
        ORDER BY e.name;
    ''')
    
    employees = cur.fetchall()
    cur.close()
    conn.close()
    
    employee_list = [{
        'id': emp[0],
        'name': emp[1],
        'priority': emp[2],
        'maxHoursPerWeek': emp[3],
        'restrictedHours': emp[4],
        'roles': emp[5]  # List of roles
    } for emp in employees]
    
    return jsonify(employee_list), 200




if __name__ == '__main__':
    app.run(debug=True)

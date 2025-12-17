import json
import os
import psycopg2
from typing import Dict, Any

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', '')
            
            if action == 'users':
                cur.execute("SELECT username, password, balance, banned, lucky_mode FROM users ORDER BY created_at DESC")
                users = []
                for row in cur.fetchall():
                    users.append({
                        'username': row[0],
                        'password': row[1],
                        'balance': row[2],
                        'banned': row[3],
                        'luckyMode': row[4]
                    })
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'users': users}),
                    'isBase64Encoded': False
                }
            
            if action == 'bets':
                cur.execute("SELECT id, creator, amount FROM bets WHERE active = TRUE ORDER BY created_at DESC")
                bets = []
                for row in cur.fetchall():
                    bets.append({'id': str(row[0]), 'creator': row[1], 'amount': row[2]})
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'bets': bets}),
                    'isBase64Encoded': False
                }
            
            if action == 'transactions':
                username = event.get('queryStringParameters', {}).get('username', '')
                cur.execute("SELECT type, amount, created_at FROM transactions WHERE username = %s ORDER BY created_at DESC LIMIT 50", (username,))
                transactions = []
                for row in cur.fetchall():
                    transactions.append({'type': row[0], 'amount': row[1], 'timestamp': row[2].timestamp() * 1000})
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'transactions': transactions}),
                    'isBase64Encoded': False
                }
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', '')
            
            if action == 'register':
                username = body.get('username', '')
                password = body.get('password', '')
                ip_address = body.get('ip', '')
                
                cur.execute("SELECT COUNT(*) FROM users WHERE ip_address = %s", (ip_address,))
                ip_count = cur.fetchone()[0]
                if ip_count >= 5:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Превышен лимит аккаунтов на один IP'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("INSERT INTO users (username, password, balance, ip_address) VALUES (%s, %s, 10, %s)", 
                           (username, password, ip_address))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            if action == 'login':
                username = body.get('username', '')
                password = body.get('password', '')
                cur.execute("SELECT balance, banned, lucky_mode FROM users WHERE username = %s AND password = %s", 
                           (username, password))
                row = cur.fetchone()
                if not row:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный логин или пароль'}),
                        'isBase64Encoded': False
                    }
                if row[1]:
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Вы забанены'}),
                        'isBase64Encoded': False
                    }
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'balance': row[0], 'luckyMode': row[2]}),
                    'isBase64Encoded': False
                }
            
            if action == 'update_balance':
                username = body.get('username', '')
                balance = body.get('balance', 0)
                cur.execute("UPDATE users SET balance = %s WHERE username = %s", (balance, username))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            if action == 'add_transaction':
                username = body.get('username', '')
                trans_type = body.get('type', '')
                amount = body.get('amount', 0)
                cur.execute("INSERT INTO transactions (username, type, amount) VALUES (%s, %s, %s)",
                           (username, trans_type, amount))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            if action == 'create_bet':
                creator = body.get('creator', '')
                amount = body.get('amount', 0)
                cur.execute("INSERT INTO bets (creator, amount) VALUES (%s, %s)", (creator, amount))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            if action == 'accept_bet':
                bet_id = body.get('bet_id', '')
                winner = body.get('winner', '')
                loser = body.get('loser', '')
                amount = body.get('amount', 0)
                
                cur.execute("UPDATE bets SET active = FALSE WHERE id = %s", (bet_id,))
                cur.execute("UPDATE users SET balance = balance + %s WHERE username = %s", (amount, winner))
                cur.execute("UPDATE users SET balance = balance - %s WHERE username = %s", (amount, loser))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            if action == 'activate_code':
                username = body.get('username', '')
                code = body.get('code', '')
                
                cur.execute("SELECT username FROM code_activations WHERE username = %s AND code = %s", (username, code))
                if cur.fetchone():
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Код уже использован'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("SELECT type, amount, activations_left FROM promo_codes WHERE code = %s", (code,))
                row = cur.fetchone()
                if not row or row[2] <= 0:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный или истёкший код'}),
                        'isBase64Encoded': False
                    }
                
                code_type = row[0]
                amount = row[1]
                
                if code_type == 'balance':
                    cur.execute("UPDATE users SET balance = balance + %s WHERE username = %s", (amount, username))
                elif code_type == 'lucky':
                    cur.execute("UPDATE users SET lucky_mode = TRUE WHERE username = %s", (username,))
                
                cur.execute("UPDATE promo_codes SET activations_left = activations_left - 1 WHERE code = %s", (code,))
                cur.execute("INSERT INTO code_activations (username, code) VALUES (%s, %s)", (username, code))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'type': code_type, 'amount': amount}),
                    'isBase64Encoded': False
                }
            
            if action == 'admin_command':
                command = body.get('command', '')
                parts = command.strip().split(' ')
                
                if parts[0] == '/п' and len(parts) == 3:
                    target_user = parts[1]
                    amount_str = parts[2]
                    is_add = amount_str.startswith('+')
                    amount = int(amount_str)
                    
                    if is_add:
                        cur.execute("UPDATE users SET balance = balance + %s WHERE username = %s", (amount, target_user))
                    else:
                        cur.execute("UPDATE users SET balance = GREATEST(0, balance + %s) WHERE username = %s", (amount, target_user))
                    conn.commit()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True}),
                        'isBase64Encoded': False
                    }
                
                if parts[0] == '/б' and len(parts) == 2:
                    target_user = parts[1]
                    cur.execute("UPDATE users SET banned = TRUE WHERE username = %s", (target_user,))
                    conn.commit()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True}),
                        'isBase64Encoded': False
                    }
                
                if parts[0] == '/к' and len(parts) == 4:
                    code = parts[1]
                    activations = int(parts[2])
                    amount = int(parts[3])
                    cur.execute("INSERT INTO promo_codes (code, type, amount, activations_left) VALUES (%s, 'balance', %s, %s)",
                               (code, amount, activations))
                    conn.commit()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True}),
                        'isBase64Encoded': False
                    }
                
                if parts[0] == '/у' and len(parts) == 3:
                    code = parts[1]
                    activations = int(parts[2])
                    cur.execute("INSERT INTO promo_codes (code, type, amount, activations_left) VALUES (%s, 'lucky', 0, %s)",
                               (code, activations))
                    conn.commit()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверная команда'}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()

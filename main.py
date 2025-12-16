import dash
from dash import html, dcc, Input, Output, State
import plotly.express as px
import pandas as pd
from datetime import datetime
import random
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
import dash_bootstrap_components as dbc

# Simulated AIS vessel data focused on India region
ais_vessels = [
    {"mmsi": "419000001", "name": "INDIAN STAR", "lat": 19.0760, "lon": 72.8777, "type": "Tanker", "speed": 12.5, "course": 45},  # Mumbai
    {"mmsi": "419000002", "name": "BAY OF BENGAL", "lat": 13.0827, "lon": 80.2707, "type": "Cargo", "speed": 8.3, "course": 180},  # Chennai
    {"mmsi": "419000003", "name": "HOOGHLY EXPRESS", "lat": 22.5726, "lon": 88.3639, "type": "Container", "speed": 15.2, "course": 270},  # Kolkata
    {"mmsi": "419000004", "name": "ARABIAN SEA", "lat": 8.5241, "lon": 76.9366, "type": "Tanker", "speed": 10.8, "course": 90},  # Trivandrum
    {"mmsi": "419000005", "name": "INDIAN OCEAN", "lat": 15.2993, "lon": 74.1240, "type": "Cargo", "speed": 18.5, "course": 135},  # Goa
    {"mmsi": "419000006", "name": "SEA MONITOR", "lat": 10.0, "lon": 80.0, "type": "Tanker", "speed": 14.0, "course": 0},  # Indian Ocean
    {"mmsi": "419000007", "name": "OCEAN PATROL", "lat": 20.0, "lon": 85.0, "type": "Cargo", "speed": 9.5, "course": 45},  # Bay of Bengal
    {"mmsi": "419000008", "name": "COAST GUARD", "lat": 18.0, "lon": 72.0, "type": "Patrol", "speed": 16.0, "course": 90},  # Arabian Sea
]

app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP], suppress_callback_exceptions=True)

app.layout = html.Div([
    dcc.Store(id='auth-store', data={'authenticated': False, 'user': None}),
    dcc.Store(id='data-store', data={'vessels': ais_vessels.copy(), 'spills': [], 'alerts': []}),
    dcc.Store(id='theme-store', data='light'),
    dcc.Interval(id='interval-component', interval=1000, n_intervals=0),  # Update every 1 second for real-time

    # Auth section
    html.Div(id='auth-div', children=[
        dbc.Container([
            dbc.Row([
                dbc.Col(
                    dbc.Card(
                        dbc.CardBody([
                            html.H2("SeaTrace Login", className="card-title text-center mb-4"),
                            dbc.Input(id='email', type='email', placeholder='Email', className='mb-2'),
                            dbc.Input(id='password', type='password', placeholder='Password', className='mb-2'),
                            dbc.Input(id='name', type='text', placeholder='Name (for signup)', className='mb-3'),
                            dbc.Button('Login', id='login-btn', color='primary', className='me-2'),
                            dbc.Button('Sign Up', id='signup-btn', color='secondary'),
                            html.Div(id='auth-error', style={'color': 'red'}, className='mt-2')
                        ])
                    ), width=6, className="mx-auto shadow")
            ])
        ], fluid=True)
    ]),

    # Main app
    html.Div(id='main-app', style={'display': 'none'}, children=[
        dbc.Container([
            dbc.Row([
                dbc.Col([
                    html.H1("SeaTrace Dashboard - India Focus", className="text-center my-4"),
                    html.Div(id='user-info', className="mb-3 text-center"),
                    dbc.Button('Logout', id='logout-btn', color='danger', className='float-end')
                ], width=12)
            ]),
            dbc.Row([
                dbc.Col([
                    dbc.Tabs(id='tabs', active_tab='dashboard', children=[
                        dbc.Tab(label="Dashboard", tab_id='dashboard'),
                        dbc.Tab(label="Monitoring", tab_id='monitoring'),
                        dbc.Tab(label="Reports", tab_id='reports'),
                        dbc.Tab(label="Alerts", tab_id='alerts'),
                        dbc.Tab(label="Settings", tab_id='settings'),
                        dbc.Tab(label="Users", tab_id='users'),  # Will show only for admin
                    ]),
                    html.Div(id='tab-content', className="mt-4")
                ], width=12)
            ]),
            dbc.Row([
                dbc.Col([
                    html.Footer("© 2025 SeaTrace AIS Monitoring. All rights reserved.", className="text-center mt-4 text-muted")
                ], width=12)
            ]),
            dcc.Download(id='download-pdf'),
            dcc.Download(id='download-csv')
        ], fluid=True, id='main-container')
    ])
])

# Auth callback
@app.callback(
    [Output('auth-store', 'data'), Output('auth-div', 'style'), Output('main-app', 'style'), Output('auth-error', 'children'), Output('user-info', 'children')],
    [Input('login-btn', 'n_clicks'), Input('signup-btn', 'n_clicks'), Input('logout-btn', 'n_clicks')],
    [State('email', 'value'), State('password', 'value'), State('name', 'value'), State('auth-store', 'data')]
)
def handle_auth(login_clicks, signup_clicks, logout_clicks, email, password, name, auth_data):
    ctx = dash.callback_context
    if not ctx.triggered:
        return auth_data, {'display': 'block'} if not auth_data['authenticated'] else {'display': 'none'}, {'display': 'none'} if not auth_data['authenticated'] else {'display': 'block'}, '', f"Welcome, {auth_data['user']['name'] if auth_data['user'] else ''}"

    button_id = ctx.triggered[0]['prop_id'].split('.')[0]

    if button_id == 'logout-btn' and logout_clicks:
        auth_data['authenticated'] = False
        auth_data['user'] = None
        return auth_data, {'display': 'block'}, {'display': 'none'}, '', ''

    if button_id in ['login-btn', 'signup-btn']:
        if not email or not password:
            return auth_data, {'display': 'block'}, {'display': 'none'}, 'Please fill email and password', ''

        # Simulate auth (in real app, call backend)
        role = 'admin' if button_id == 'login-btn' and email == 'admin@seatrace.com' else 'user'
        user = {'name': name or email.split('@')[0], 'role': role, 'id': str(random.randint(1000, 9999))}
        auth_data['authenticated'] = True
        auth_data['user'] = user
        return auth_data, {'display': 'none'}, {'display': 'block'}, '', f"Welcome, {user['name']} ({role})"

    return auth_data, {'display': 'block'}, {'display': 'none'}, '', f"Welcome, {auth_data['user']['name'] if auth_data['user'] else ''}"

# Tab content callback
@app.callback(
    Output('tab-content', 'children'),
    Input('tabs', 'active_tab'),
    State('data-store', 'data'),
    State('auth-store', 'data')
)
def render_tab(tab, data, auth):
    vessels = data['vessels']
    spills = data['spills']
    alerts = data['alerts']
    user = auth.get('user', {})
    role = user.get('role', 'user')

    if tab == 'dashboard':
        return dbc.Container([
            dbc.Row([
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader("Overview"),
                        dbc.CardBody([
                            html.Div(f"Total Vessels: {len(vessels)}", className="mb-2"),
                            html.Div(f"Active Spills: {len(spills)}", className="mb-2"),
                            html.Div(f"Alerts: {len(alerts)}")
                        ])
                    ], className="mb-4")
                ], width=12)
            ]),
            dbc.Row([
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader("Real-Time AIS Map"),
                        dbc.CardBody([
                            dcc.Graph(
                                id='map',
                                figure=px.scatter_geo(
                                    lat=[v['lat'] for v in vessels] + [s.get('lat', 0) for s in spills],
                                    lon=[v['lon'] for v in vessels] + [s.get('lon', 0) for s in spills],
                                    text=[v['name'] for v in vessels] + [f"Spill {s.get('id', '')}" for s in spills],
                                    color=['Vessel'] * len(vessels) + ['Spill'] * len(spills),
                                    color_discrete_map={'Vessel': 'blue', 'Spill': 'red'},
                                    title="Real-Time AIS Vessel and Spill Monitoring - India Region"
                                ).update_geos(center=dict(lat=15, lon=80), projection_scale=3, scope='asia').update_layout(height=600)
                            )
                        ])
                    ])
                ], width=12)
            ])
        ], fluid=True)

    elif tab == 'monitoring':
        vessel_rows = [html.Tr([html.Th("MMSI"), html.Th("Name"), html.Th("Type"), html.Th("Speed"), html.Th("Course"), html.Th("Lat"), html.Th("Lon")])]
        vessel_rows += [html.Tr([html.Td(v['mmsi']), html.Td(v['name']), html.Td(v['type']), html.Td(v['speed']), html.Td(v['course']), html.Td(f"{v['lat']:.4f}"), html.Td(f"{v['lon']:.4f}")]) for v in vessels]
        
        spill_rows = [html.Tr([html.Th("ID"), html.Th("Location"), html.Th("Severity"), html.Th("Size"), html.Th("Vessel"), html.Th("Confidence"), html.Th("Time")])]
        spill_rows += [html.Tr([html.Td(s.get('id', '')), html.Td(s.get('location', '')), html.Td(s.get('severity', '')), html.Td(s.get('size', '')), html.Td(s.get('vessel', '')), html.Td(s.get('confidence', '')), html.Td(s.get('timestamp', ''))]) for s in spills]
        
        return dbc.Container([
            dbc.Row([
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader("Vessel Monitoring"),
                        dbc.CardBody([
                            dbc.Input(id='vessel-search', type='text', placeholder='Search vessels by name...', className='mb-3'),
                            html.Table(vessel_rows, className='table table-bordered table-hover')
                        ])
                    ], className="mb-4 shadow")
                ], width=12)
            ]),
            dbc.Row([
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader("Spill Monitoring"),
                        dbc.CardBody([
                            dbc.Select(id='spill-filter', options=[
                                {'label': 'All', 'value': 'all'},
                                {'label': 'Low', 'value': 'Low'},
                                {'label': 'Medium', 'value': 'Medium'},
                                {'label': 'High', 'value': 'High'},
                                {'label': 'Critical', 'value': 'Critical'}
                            ], value='all', className='mb-3'),
                            html.Table(spill_rows, className='table table-bordered table-hover', id='spill-table') if spills else html.P("No spills detected")
                        ])
                    ], className="shadow")
                ], width=12)
            ])
        ], fluid=True)

    elif tab == 'reports':
        return dbc.Container([
            dbc.Row(dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Reports"),
                    dbc.CardBody([
                        html.P('Generate and download reports of current vessel and spill data.'),
                        dbc.Button('Generate PDF Report', id='generate-report-btn', color='primary', className='me-2'),
                        dbc.Button('Export to CSV', id='export-csv-btn', color='secondary'),
                        html.Div(id='report-status', className='mt-3')
                    ])
                ], className="shadow")
            ], width=6, className="mx-auto"))
        ], fluid=True)

    elif tab == 'alerts':
        alert_items = [dbc.ListGroupItem(f"{a.get('time', '')}: {a.get('message', '')} ({a.get('severity', '')})", color='warning' if a.get('severity') == 'High' else 'info') for a in alerts]
        return dbc.Container([
            dbc.Row(dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Alerts"),
                    dbc.CardBody([
                        dbc.ListGroup(alert_items) if alert_items else html.P('No alerts'),
                        dbc.Toast(
                            "New alerts will appear here in real-time.",
                            header="Notifications",
                            is_open=True,
                            dismissable=True,
                            className="mt-3"
                        ) if alerts else None
                    ])
                ], className="shadow")
            ], width=8, className="mx-auto"))
        ], fluid=True)

    elif tab == 'settings':
        return dbc.Container([
            dbc.Row(dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Settings"),
                    dbc.CardBody([
                        html.H5("Theme"),
                        dbc.RadioItems(
                            id='theme-toggle',
                            options=[
                                {'label': 'Light Mode', 'value': 'light'},
                                {'label': 'Dark Mode', 'value': 'dark'}
                            ],
                            value='light',
                            className='mb-3'
                        ),
                        html.H5("Monitoring"),
                        dbc.Checklist(
                            id='monitoring-toggle',
                            options=[{'label': 'Enable Real-time Monitoring', 'value': 'enabled'}],
                            value=['enabled'],
                            className='mb-3'
                        ),
                        html.H5("Language"),
                        dbc.Select(
                            id='language-select',
                            options=[
                                {'label': 'English', 'value': 'en'},
                                {'label': 'Hindi', 'value': 'hi'}
                            ],
                            value='en',
                            className='mb-3'
                        ),
                        dbc.Button('Save Settings', id='save-settings-btn', color='success')
                    ])
                ])
            ], width=6, className="mx-auto"))
        ], fluid=True)

    elif tab == 'users':
        if role != 'admin':
            return dbc.Container([dbc.Alert("Access Denied: Admin privileges required", color="danger")], fluid=True)
        # Simulate user list
        user_list = [
            {'id': 1, 'name': user.get('name', 'Unknown'), 'email': 'user@example.com', 'role': role}
        ]
        user_rows = [html.Tr([html.Th("ID"), html.Th("Name"), html.Th("Email"), html.Th("Role")])]
        user_rows += [html.Tr([html.Td(u['id']), html.Td(u['name']), html.Td(u['email']), html.Td(u['role'])]) for u in user_list]
        return dbc.Container([
            dbc.Row(dbc.Col([
                dbc.Card([
                    dbc.CardHeader("User Management"),
                    dbc.CardBody([
                        dbc.Table(user_rows, bordered=True, hover=True, responsive=True)
                    ])
                ], className="shadow")
            ], width=8, className="mx-auto"))
        ], fluid=True)

    return html.Div('Tab content')

# Update data callback
@app.callback(
    Output('data-store', 'data'),
    Input('interval-component', 'n_intervals'),
    State('data-store', 'data'),
    State('auth-store', 'data'),
    State('monitoring-toggle', 'value')
)
def update_data(n, data, auth, monitoring):
    if not auth.get('authenticated', False) or 'enabled' not in (monitoring or []):
        return data

    vessels = data['vessels']
    # Simulate movement
    for v in vessels:
        v['lat'] += (random.random() - 0.5) * 0.01
        v['lon'] += (random.random() - 0.5) * 0.01

    # Simulate spill detection
    if random.random() > 0.8:
        v = random.choice(vessels)
        spill = {
            'id': random.randint(10000, 99999),
            'location': f"{v['lat']:.4f}°N, {v['lon']:.4f}°E",
            'lat': v['lat'],
            'lon': v['lon'],
            'severity': random.choice(['Low', 'Medium', 'High', 'Critical']),
            'size': f"{random.uniform(10, 50):.2f} km²",
            'vessel': v['name'],
            'mmsi': v['mmsi'],
            'vesselType': v['type'],
            'confidence': f"{random.uniform(70, 100):.1f}%",
            'timestamp': datetime.now().strftime('%H:%M:%S'),
            'weather': random.choice(['Clear', 'Cloudy', 'Rainy']),
            'windSpeed': f"{random.uniform(5, 20):.1f} knots",
            'waveHeight': f"{random.uniform(0.5, 3):.1f} m"
        }
        data['spills'].insert(0, spill)
        data['spills'] = data['spills'][:20]

        alert = {
            'id': random.randint(10000, 99999),
            'message': f"{spill['severity']} severity spill detected near {spill['vessel']}",
            'time': spill['timestamp'],
            'severity': spill['severity']
        }
        data['alerts'].insert(0, alert)
        data['alerts'] = data['alerts'][:10]

    return data

# Report callback
@app.callback(
    Output('download-pdf', 'data'),
    Input('generate-report-btn', 'n_clicks'),
    State('data-store', 'data')
)
def generate_report(n_clicks, data):
    if n_clicks:
        vessels = data['vessels']
        spills = data['spills']
        alerts = data['alerts']
        
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        
        c.drawString(100, 750, "SeaTrace AIS Monitoring Report")
        c.drawString(100, 730, f"Generated at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        c.drawString(100, 710, f"Total Vessels: {len(vessels)}")
        c.drawString(100, 690, f"Active Spills: {len(spills)}")
        c.drawString(100, 670, f"Alerts: {len(alerts)}")
        
        y = 640
        c.drawString(100, y, "Vessel Positions:")
        y -= 20
        for v in vessels[:15]:  # Limit to fit page
            c.drawString(100, y, f"{v['name']} ({v['mmsi']}) - Lat: {v['lat']:.4f}, Lon: {v['lon']:.4f}, Speed: {v['speed']} knots")
            y -= 15
            if y < 100:
                c.showPage()
                y = 750
        
        y -= 20
        if spills:
            c.drawString(100, y, "Detected Spills:")
            y -= 20
            for s in spills[:10]:
                c.drawString(100, y, f"ID {s['id']} - {s['severity']} at {s['location']}, Confidence: {s['confidence']}")
                y -= 15
                if y < 100:
                    c.showPage()
                    y = 750
        
        c.save()
        buffer.seek(0)
        
        return dcc.send_bytes(buffer.getvalue(), "seatrace_ais_report.pdf")
    
    return None

# Filter vessels callback
@app.callback(
    Output('vessel-table', 'children'),
    Input('vessel-search', 'value'),
    State('data-store', 'data')
)
def filter_vessels(search, data):
    vessels = data['vessels']
    if search:
        vessels = [v for v in vessels if search.lower() in v['name'].lower()]
    rows = [html.Tr([html.Th("MMSI"), html.Th("Name"), html.Th("Type"), html.Th("Speed"), html.Th("Course"), html.Th("Lat"), html.Th("Lon")])]
    rows += [html.Tr([html.Td(v['mmsi']), html.Td(v['name']), html.Td(v['type']), html.Td(v['speed']), html.Td(v['course']), html.Td(f"{v['lat']:.4f}"), html.Td(f"{v['lon']:.4f}")]) for v in vessels]
    return rows

# Filter spills callback
@app.callback(
    Output('spill-table', 'children'),
    Input('spill-filter', 'value'),
    State('data-store', 'data')
)
def filter_spills(filter_val, data):
    spills = data['spills']
    if filter_val != 'all':
        spills = [s for s in spills if s.get('severity') == filter_val]
    rows = [html.Tr([html.Th("ID"), html.Th("Location"), html.Th("Severity"), html.Th("Size"), html.Th("Vessel"), html.Th("Confidence"), html.Th("Time")])]
    rows += [html.Tr([html.Td(s.get('id', '')), html.Td(s.get('location', '')), html.Td(s.get('severity', '')), html.Td(s.get('size', '')), html.Td(s.get('vessel', '')), html.Td(s.get('confidence', '')), html.Td(s.get('timestamp', ''))]) for s in spills]
    return rows

# CSV export callback
@app.callback(
    Output('download-csv', 'data'),
    Input('export-csv-btn', 'n_clicks'),
    State('data-store', 'data')
)
def export_csv(n_clicks, data):
    if n_clicks:
        import io
        vessels = data['vessels']
        spills = data['spills']
        output = io.StringIO()
        output.write("Vessels\n")
        output.write("MMSI,Name,Type,Speed,Course,Lat,Lon\n")
        for v in vessels:
            output.write(f"{v['mmsi']},{v['name']},{v['type']},{v['speed']},{v['course']},{v['lat']:.4f},{v['lon']:.4f}\n")
        output.write("\nSpills\n")
        output.write("ID,Location,Severity,Size,Vessel,Confidence,Time\n")
        for s in spills:
            output.write(f"{s.get('id', '')},{s.get('location', '')},{s.get('severity', '')},{s.get('size', '')},{s.get('vessel', '')},{s.get('confidence', '')},{s.get('timestamp', '')}\n")
        return dcc.send_string(output.getvalue(), "seatrace_data.csv")
    return None

# Theme callback
@app.callback(
    Output('theme-store', 'data'),
    Input('theme-toggle', 'value')
)
def update_theme(value):
    return value

if __name__ == '__main__':
    app.run(debug=True)
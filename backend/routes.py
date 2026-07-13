from flask import Blueprint
from controllers import (
    get_lemari_controller,
    scan_baju_controller,
    generate_ootd_controller,
    pakai_baju_controller,
    cuci_baju_controller,
    cek_cuaca_ui_controller,
    virtual_tryon_controller,
    tambah_baju_manual_controller
)

# Membuat Blueprint (Grup Rute) bernama 'api'
api = Blueprint('api', __name__)

# Mendaftarkan rute dengan fungsi dari controller
api.add_url_rule('/lemari', view_func=get_lemari_controller, methods=['GET'])
api.add_url_rule('/scan-baju', view_func=scan_baju_controller, methods=['POST'])
api.add_url_rule('/generate-ootd', view_func=generate_ootd_controller, methods=['POST'])
api.add_url_rule('/pakai-baju', view_func=pakai_baju_controller, methods=['POST'])
api.add_url_rule('/cuci-baju', view_func=cuci_baju_controller, methods=['POST'])
api.add_url_rule('/cuaca', view_func=cek_cuaca_ui_controller, methods=['POST', 'OPTIONS'])
api.add_url_rule('/virtual-tryon', view_func=virtual_tryon_controller, methods=['POST'])
api.add_url_rule('/tambah-manual', view_func=tambah_baju_manual_controller, methods=['POST'])